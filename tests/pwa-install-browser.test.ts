import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getPwaServerSnapshot,
  getPwaSnapshot,
  requestPwaInstall,
  subscribePwa,
} from "../lib/pwa-browser";
import { PWA_DISMISS_KEY } from "../lib/pwa-policy";

test("native install controller consumes each event once, respects refusal and only confirms installation on appinstalled", async () => {
  const originals = Object.fromEntries(
    ["window", "document", "navigator"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ])
  );
  const values = new Map<string, string>();
  const mode = Object.assign(new EventTarget(), { matches: false });
  const browser = Object.assign(new EventTarget(), {
    isSecureContext: true,
    matchMedia: () => mode,
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  const dataset: Record<string, string> = {};
  for (const [key, value] of Object.entries({
    window: browser,
    document: { documentElement: { dataset } },
    navigator: {
      userAgent:
        "Mozilla/5.0 (Linux; Android 14) Chrome/130.0 Mobile Safari/537.36",
      platform: "Linux",
      maxTouchPoints: 5,
    },
  })) {
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  let unsubscribe = () => {};
  try {
    unsubscribe = subscribePwa(() => {});
    assert.equal(getPwaSnapshot().platform, "android");
    assert.equal(getPwaSnapshot().nativeReady, false);
    assert.equal(
      getPwaServerSnapshot().ready,
      false,
      "SSR never inherits the device state"
    );
    const broken = Object.assign(
      new Event("beforeinstallprompt", { cancelable: true }),
      {
        prompt: async () => {
          throw new Error("Browser refused");
        },
      }
    );
    browser.dispatchEvent(broken);
    assert.equal(broken.defaultPrevented, true);
    assert.equal(await requestPwaInstall(), "error");
    assert.equal(dataset.pwaInstallActive, undefined);
    assert.equal(getPwaSnapshot().busy, false);

    let calls = 0;
    let resolveChoice!: (choice: { outcome: "dismissed" }) => void;
    browser.dispatchEvent(
      Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
        prompt: () => {
          calls += 1;
          return new Promise<{ outcome: "dismissed" }>((resolve) => {
            resolveChoice = resolve;
          });
        },
      })
    );
    const pending = requestPwaInstall();
    assert.equal(getPwaSnapshot().busy, true);
    assert.equal(
      dataset.pwaInstallActive,
      "true",
      "advertising overlays pause during the native dialog"
    );
    assert.equal(await requestPwaInstall(), "unavailable");
    resolveChoice({ outcome: "dismissed" });
    assert.equal(await pending, "dismissed");
    assert.equal(calls, 1);
    assert.ok(getPwaSnapshot().dismissedUntil > Date.now());
    assert.equal(JSON.parse(values.get(PWA_DISMISS_KEY)!).version, 1);
    assert.equal(getPwaSnapshot().installed, false);

    browser.dispatchEvent(
      Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
        prompt: async () => ({ outcome: "accepted" as const }),
      })
    );
    assert.equal(await requestPwaInstall(), "accepted");
    assert.equal(getPwaSnapshot().requested, true);
    assert.equal(
      getPwaSnapshot().installed,
      false,
      "acceptance is not treated as a completed OS installation"
    );
    browser.dispatchEvent(new Event("appinstalled"));
    assert.equal(getPwaSnapshot().installed, true);
    assert.equal(await requestPwaInstall(), "unavailable");
    mode.matches = true;
    mode.dispatchEvent(new Event("change"));
    assert.equal(getPwaSnapshot().standalone, true);
    assert.equal(dataset.pwaInstallActive, undefined);
  } finally {
    unsubscribe();
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
