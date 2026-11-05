import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { test } from "node:test";

const ORIGIN = "https://pwa.example.invalid";
const workerSource = readFileSync(
  new URL("../public/sw.js", import.meta.url),
  "utf8"
);
const CACHE_NAMES = {
  shell: "bomainfos-shell-v4",
  pages: "bomainfos-pages-v4",
  assets: "bomainfos-assets-v4",
};
const keyOf = (request: string | { url: string }) =>
  new URL(typeof request === "string" ? request : request.url, ORIGIN).href;
const html = (body: string, headers: Record<string, string> = {}) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      ...headers,
    },
  });
const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

function workerHarness() {
  const handlers = new Map<string, (event: unknown) => void>();
  const stats = { reads: 0, opens: 0, network: 0, claimed: 0, installed: 0 };
  class MemoryCache {
    entries = new Map<string, Response>();
    async match(request: string | { url: string }) {
      stats.reads += 1;
      return this.entries.get(keyOf(request))?.clone();
    }
    async put(request: string | { url: string }, response: Response) {
      this.entries.set(keyOf(request), response.clone());
    }
    async delete(request: string | { url: string }) {
      return this.entries.delete(keyOf(request));
    }
    async keys() {
      return [...this.entries.keys()].map((url) => new Request(url));
    }
  }
  const buckets = new Map<string, MemoryCache>();
  const storage = {
    async open(name: string) {
      stats.opens += 1;
      if (!buckets.has(name)) buckets.set(name, new MemoryCache());
      return buckets.get(name)!;
    },
    async keys() {
      return [...buckets.keys()];
    },
    async delete(name: string) {
      return buckets.delete(name);
    },
    async match() {
      throw new Error("Origin-wide cache lookup is forbidden");
    },
  };
  type Network = (
    request: string | { url: string },
    options?: { signal?: AbortSignal }
  ) => Promise<Response>;
  let network: Network = async () => html("network article");
  const timers = new Map<number, () => void>();
  let timerId = 0;
  runInNewContext(workerSource, {
    URL,
    Request,
    Response,
    AbortController,
    caches: storage,
    self: {
      location: { origin: ORIGIN },
      addEventListener: (type: string, handler: (event: unknown) => void) =>
        handlers.set(type, handler),
      skipWaiting: async () => {
        stats.installed += 1;
      },
      clients: {
        claim: async () => {
          stats.claimed += 1;
        },
      },
    },
    fetch: (
      request: string | { url: string },
      options?: { signal?: AbortSignal }
    ) => {
      stats.network += 1;
      return network(request, options);
    },
    setTimeout: (callback: () => void) => {
      timers.set(++timerId, callback);
      return timerId;
    },
    clearTimeout: (id: number) => {
      timers.delete(id);
    },
  });
  function dispatch(path: string, mode = "navigate", method = "GET") {
    let response: Promise<Response> | undefined;
    const request = { url: keyOf(path), mode, method };
    handlers.get("fetch")!({
      request,
      respondWith: (value: Promise<Response>) => {
        response = Promise.resolve(value);
      },
    });
    return response;
  }
  async function lifecycle(type: string, data?: unknown) {
    const pending: Promise<unknown>[] = [];
    handlers.get(type)!({
      data,
      waitUntil: (work: Promise<unknown>) => pending.push(work),
    });
    await Promise.all(pending);
  }
  return {
    storage,
    buckets,
    stats,
    timers,
    handlers,
    dispatch,
    lifecycle,
    setNetwork(value: Network) {
      network = value;
    },
    expireTimers() {
      for (const callback of [...timers.values()]) callback();
    },
  };
}

test("public article navigations prefer the network and become available offline", async () => {
  const h = workerHarness();
  assert.equal(
    await (await h.dispatch("/article-public")!).text(),
    "network article"
  );
  h.setNetwork(async () => {
    throw new Error("offline");
  });
  assert.equal(
    await (await h.dispatch("/article-public")!).text(),
    "network article"
  );
  assert.equal(h.timers.size, 0, "failed requests clear their timeout too");
  assert.equal(
    h.dispatch("/article-public", "cors"),
    undefined,
    "RSC/data responses stay network-only"
  );
});

test("private pages and API requests never intercept or read current or old cached documents", async () => {
  const h = workerHarness();
  const paths = [
    "/redaction",
    "/entreprise",
    "/compte",
    "/connexion",
    "/inscription-entreprise",
    "/mot-de-passe-oublie",
    "/reinitialisation",
    "/api",
  ];
  const current = await h.storage.open(CACHE_NAMES.pages);
  const old = await h.storage.open("bomainfos-pages-v3");
  for (const path of paths) {
    for (const url of [path, `${path}/nested?next=/`]) {
      await current.put(url, html("private current copy"));
      await old.put(url, html("private old copy"));
    }
  }
  h.setNetwork(async () => {
    throw new Error("offline");
  });
  const before = { ...h.stats };
  for (const path of paths) {
    assert.equal(h.dispatch(path), undefined, path);
    assert.equal(h.dispatch(`${path}/nested?next=/`), undefined, path);
    assert.equal(h.dispatch(path, "cors"), undefined, path);
  }
  assert.equal(h.dispatch("/%72edaction/edition"), undefined);
  assert.equal(h.dispatch("/redaction%2fedition"), undefined);
  assert.equal(h.stats.reads, before.reads);
  assert.equal(h.stats.opens, before.opens);
  assert.equal(
    h.stats.network,
    0,
    "the browser keeps responsibility for network-only requests"
  );
  h.setNetwork(async () => html("public report"));
  assert.equal(
    await (await h.dispatch("/compte-rendu-du-conseil")!).text(),
    "public report"
  );
});

test("private, no-store and nonce responses evict old public copies and cannot replay offline", async () => {
  const cases: Record<string, string>[] = [
    { "Cache-Control": "private, max-age=3600" },
    { "Cache-Control": "no-store" },
    { "Content-Security-Policy": "script-src 'nonce-fixture'" },
  ];
  for (const headers of cases) {
    const h = workerHarness();
    const pages = await h.storage.open(CACHE_NAMES.pages);
    await pages.put("/public-page", html("old public copy"));
    h.setNetwork(async () => html("new non-cacheable response", headers));
    assert.equal(
      await (await h.dispatch("/public-page")!).text(),
      "new non-cacheable response"
    );
    assert.equal(pages.entries.has(keyOf("/public-page")), false);
    await pages.put("/public-page", html("invalid old cached copy", headers));
    h.setNetwork(async () => {
      throw new Error("offline");
    });
    const response = await h.dispatch("/public-page")!;
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /old cached copy/);
    assert.equal(pages.entries.has(keyOf("/public-page")), false);
  }
});

test("installation precaches only the public offline shell and fallback ignores foreign caches", async () => {
  const h = workerHarness();
  const foreign = await h.storage.open("another-app-shell");
  await foreign.put("/hors-ligne", html("foreign fallback"));
  h.setNetwork(async (request) =>
    html(
      keyOf(request).endsWith("/hors-ligne")
        ? "BOMA offline shell"
        : "network page"
    )
  );
  await h.lifecycle("install");
  assert.equal(h.stats.installed, 1);
  assert.equal(h.stats.network, 1);
  assert.deepEqual(
    [...h.buckets.get(CACHE_NAMES.shell)!.entries.keys()],
    [keyOf("/hors-ligne")]
  );
  h.setNetwork(async () => {
    throw new Error("offline");
  });
  assert.equal(
    await (await h.dispatch("/not-read-before")!).text(),
    "BOMA offline shell"
  );
  await h.storage.delete(CACHE_NAMES.shell);
  assert.equal(
    (await h.dispatch("/not-read-before")!).status,
    503,
    "a foreign cache is never a fallback"
  );
});

test("a network timeout returns the public cached article without leaving pending timers", async () => {
  const h = workerHarness();
  await (
    await h.storage.open(CACHE_NAMES.pages)
  ).put("/slow-article", html("saved public article"));
  h.setNetwork(
    async (_request, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener(
          "abort",
          () => reject(new Error("aborted")),
          { once: true }
        );
      })
  );
  const pending = h.dispatch("/slow-article")!;
  await flush();
  assert.equal(h.timers.size, 1);
  h.expireTimers();
  assert.equal(await (await pending).text(), "saved public article");
  assert.equal(h.timers.size, 0);
});

test("activation removes only previous BOMA cache names and claims clients", async () => {
  const h = workerHarness();
  const foreign = ["other-app-v3", "workbox-precache", "foreign-v4"];
  for (const name of [
    ...Object.values(CACHE_NAMES),
    ...foreign,
    "bomainfos-pages-v3",
    "bomainfos-assets-v2",
    "bomainfos-old-v4",
  ])
    await h.storage.open(name);
  await h.lifecycle("activate");
  assert.deepEqual(
    (await h.storage.keys()).sort(),
    [...Object.values(CACHE_NAMES), ...foreign].sort()
  );
  assert.equal(h.stats.claimed, 1);
  assert.equal(h.handlers.has("push"), false);
  assert.equal(h.handlers.has("notificationclick"), false);
});

test("the page cache stays at forty entries and media purge only clears BOMA assets", async () => {
  const h = workerHarness();
  for (let index = 0; index < 43; index += 1)
    await h.dispatch(`/article-${index}`)!;
  const pages = h.buckets.get(CACHE_NAMES.pages)!;
  assert.equal(pages.entries.size, 40);
  assert.equal(pages.entries.has(keyOf("/article-0")), false);
  assert.equal(pages.entries.has(keyOf("/article-42")), true);
  await h.storage.open(CACHE_NAMES.assets);
  await h.storage.open("other-assets");
  await h.lifecycle("message", { type: "purge-medias" });
  assert.equal(h.buckets.has(CACHE_NAMES.assets), false);
  assert.equal(h.buckets.has(CACHE_NAMES.pages), true);
  assert.equal(h.buckets.has("other-assets"), true);
});

test("immutable assets use their own cache but private assets never enter it", async () => {
  for (const cacheControl of [
    "public, immutable",
    "private, immutable",
    "no-store, immutable",
  ]) {
    const h = workerHarness();
    h.setNetwork(async () => {
      const response = new Response("image", {
        headers: { "Cache-Control": cacheControl },
      });
      Object.defineProperty(response, "type", { value: "basic" });
      return response;
    });
    await h.dispatch("/medias/poster-640.webp", "cors")!;
    await h.dispatch("/medias/poster-640.webp", "cors")!;
    assert.equal(h.stats.network, cacheControl.startsWith("public") ? 1 : 2);
  }
});

test("denied cache storage still serves the network for documents and assets", async () => {
  for (const [path, mode] of [
    ["/public-article", "navigate"],
    ["/medias/poster-640.webp", "cors"],
  ]) {
    const h = workerHarness();
    h.storage.open = async () => {
      throw new Error("storage denied");
    };
    const response = html("fresh network reply");
    h.setNetwork(async () => response);
    assert.equal(await h.dispatch(path, mode)!, response);
    assert.equal(h.stats.network, 1);
  }
});

test("put or trim failures never replace a successful network reply with a cached copy", async () => {
  for (const operation of ["put", "trim"] as const) {
    const h = workerHarness();
    const pages = await h.storage.open(CACHE_NAMES.pages);
    await pages.put("/public-article", html("stale cached reply"));
    if (operation === "put")
      pages.put = async () => {
        throw new Error("quota exceeded");
      };
    else
      pages.keys = async () => {
        throw new Error("cache inaccessible during trim");
      };
    const response = html("fresh network reply");
    h.setNetwork(async () => response);
    assert.equal(await h.dispatch("/public-article")!, response, operation);
    assert.equal(
      h.stats.reads,
      0,
      "network success never enters the fallback path"
    );
  }
  const h = workerHarness();
  const assets = await h.storage.open(CACHE_NAMES.assets);
  assets.put = async () => {
    throw new Error("asset quota exceeded");
  };
  const response = new Response("fresh asset", {
    headers: { "Cache-Control": "public, immutable" },
  });
  Object.defineProperty(response, "type", { value: "basic" });
  h.setNetwork(async () => response);
  assert.equal(await h.dispatch("/medias/poster-640.webp", "cors")!, response);
});

function registrationHarness(production: boolean, readyState = "complete") {
  const effects: (() => void | (() => void))[] = [];
  const registrations: {
    active?: { scriptURL: string };
    waiting?: { scriptURL: string };
    installing?: { scriptURL: string };
    unregister: () => Promise<boolean>;
  }[] = [];
  const registered: { url: string; options: Record<string, unknown> }[] = [];
  const cacheNames = [
    "bomainfos-pages-v3",
    "bomainfos-assets-v4",
    "other-app-cache",
  ];
  const deleted: string[] = [];
  const events = new Map<string, () => void>();
  const source = readFileSync(
    new URL("../components/custom/service-worker.tsx", import.meta.url),
    "utf8"
  )
    .replace(/import\s+\{\s*useEffect\s*\}\s+from\s+["']react["'];?/, "")
    .replace("export function ServiceWorker", "function ServiceWorker");
  const storage = {
    keys: async () => cacheNames,
    delete: async (name: string) => {
      deleted.push(name);
      return true;
    },
  };
  runInNewContext(`${source}\nServiceWorker();`, {
    URL,
    useEffect: (effect: () => void | (() => void)) => effects.push(effect),
    process: { env: { NODE_ENV: production ? "production" : "development" } },
    navigator: {
      serviceWorker: {
        getRegistrations: async () => registrations,
        register: async (url: string, options: Record<string, unknown>) => {
          registered.push({ url, options: { ...options } });
          return {};
        },
      },
    },
    document: { readyState },
    caches: storage,
    window: {
      location: { origin: ORIGIN },
      caches: storage,
      addEventListener: (type: string, callback: () => void) =>
        events.set(type, callback),
      removeEventListener: (type: string, callback: () => void) => {
        if (events.get(type) === callback) events.delete(type);
      },
    },
  });
  return { effects, registrations, registered, deleted, events };
}

test("development cleanup only unregisters this origin's sw.js and BOMA caches", async () => {
  const h = registrationHarness(false);
  const removed: string[] = [];
  for (const [name, state, scriptURL] of [
    ["own-active", "active", `${ORIGIN}/sw.js`],
    ["own-waiting", "waiting", `${ORIGIN}/sw.js?old=1`],
    ["own-installing", "installing", `${ORIGIN}/sw.js`],
    ["other-script", "active", `${ORIGIN}/other-sw.js`],
    ["other-origin", "active", "https://other.example.invalid/sw.js"],
  ]) {
    h.registrations.push({
      [state]: { scriptURL },
      unregister: async () => {
        removed.push(name);
        return true;
      },
    });
  }
  h.effects[0]();
  await flush();
  assert.deepEqual(removed.sort(), [
    "own-active",
    "own-installing",
    "own-waiting",
  ]);
  assert.deepEqual(h.deleted.sort(), [
    "bomainfos-assets-v4",
    "bomainfos-pages-v3",
  ]);
  assert.equal(h.registered.length, 0);
});

test("production registration uses the root worker without the HTTP script cache", async () => {
  const h = registrationHarness(true);
  h.effects[0]();
  await flush();
  assert.deepEqual(h.registered, [
    { url: "/sw.js", options: { scope: "/", updateViaCache: "none" } },
  ]);
  assert.equal(h.deleted.length, 0);
});

test("registration waits for load and removes the listener on cleanup", () => {
  const h = registrationHarness(true, "loading");
  const cleanup = h.effects[0]();
  assert.equal(h.registered.length, 0);
  assert.ok(h.events.has("load"));
  assert.equal(typeof cleanup, "function");
  if (typeof cleanup === "function") cleanup();
  assert.equal(h.events.has("load"), false);
});
