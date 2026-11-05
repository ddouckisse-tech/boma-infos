import {
  detectPwaPlatform,
  isEmbeddedBrowser,
  parseInstallDismissal,
  PWA_DISMISS_KEY,
  PWA_DISMISS_MS,
  type PwaPlatform,
} from "./pwa-policy";

type Choice = { outcome: "accepted" | "dismissed" };
type InstallEvent = Event & {
  prompt: () => Promise<Choice | void>;
  userChoice?: Promise<Choice>;
};
type Snapshot = {
  ready: boolean;
  platform: PwaPlatform;
  embedded: boolean;
  secure: boolean;
  standalone: boolean;
  installed: boolean;
  nativeReady: boolean;
  requested: boolean;
  busy: boolean;
  dismissedUntil: number;
  checkedAt: number;
};
const initial: Snapshot = {
  ready: false,
  platform: "other",
  embedded: false,
  secure: false,
  standalone: false,
  installed: false,
  nativeReady: false,
  requested: false,
  busy: false,
  dismissedUntil: 0,
  checkedAt: 0,
};
let snapshot = initial;
let deferred: InstallEvent | undefined;
let cleanup: (() => void) | undefined;
const listeners = new Set<() => void>();
const publish = (patch: Partial<Snapshot>) => {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
};
function persisted(now: number) {
  try {
    return parseInstallDismissal(
      window.localStorage.getItem(PWA_DISMISS_KEY),
      now
    );
  } catch {
    return 0;
  }
}
function start() {
  const media = window.matchMedia("(display-mode: standalone)");
  const standalone = () =>
    media.matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const now = Date.now();
  publish({
    ready: true,
    platform: detectPwaPlatform(navigator),
    embedded: isEmbeddedBrowser(navigator.userAgent),
    secure: window.isSecureContext,
    standalone: standalone(),
    dismissedUntil: Math.max(snapshot.dismissedUntil, persisted(now)),
    checkedAt: now,
  });
  const capture = (event: Event) => {
    if (
      typeof (event as InstallEvent).prompt !== "function" ||
      standalone() ||
      snapshot.installed
    )
      return;
    event.preventDefault();
    deferred = event as InstallEvent;
    publish({ nativeReady: true, requested: false });
  };
  const installed = () => {
    deferred = undefined;
    publish({ installed: true, nativeReady: false, requested: false });
  };
  const mode = () => {
    const active = standalone();
    if (active) deferred = undefined;
    publish({
      standalone: active,
      nativeReady: active ? false : Boolean(deferred),
    });
  };
  const storage = (event: StorageEvent) => {
    if (event.key !== PWA_DISMISS_KEY && event.key !== null) return;
    const now = Date.now();
    publish({
      dismissedUntil: Math.max(
        snapshot.dismissedUntil,
        parseInstallDismissal(event.newValue, now)
      ),
      checkedAt: now,
    });
  };
  window.addEventListener("beforeinstallprompt", capture);
  window.addEventListener("appinstalled", installed);
  window.addEventListener("storage", storage);
  media.addEventListener("change", mode);
  cleanup = () => {
    window.removeEventListener("beforeinstallprompt", capture);
    window.removeEventListener("appinstalled", installed);
    window.removeEventListener("storage", storage);
    media.removeEventListener("change", mode);
    cleanup = undefined;
  };
}
export const getPwaSnapshot = () => snapshot;
export const getPwaServerSnapshot = () => initial;
export function subscribePwa(listener: () => void) {
  listeners.add(listener);
  if (!cleanup) start();
  return () => {
    listeners.delete(listener);
    if (!listeners.size) cleanup?.();
  };
}
export function dismissPwaInvitation() {
  const checkedAt = Date.now();
  const dismissedUntil = checkedAt + PWA_DISMISS_MS;
  try {
    window.localStorage.setItem(
      PWA_DISMISS_KEY,
      JSON.stringify({ version: 1, until: dismissedUntil })
    );
  } catch {
    /* Tab memory still respects dismissal. */
  }
  publish({ dismissedUntil, checkedAt });
}
/** Called directly by a click; each browser event is consumed exactly once. */
export async function requestPwaInstall(): Promise<
  "accepted" | "dismissed" | "unavailable" | "error"
> {
  if (
    !deferred ||
    snapshot.busy ||
    snapshot.installed ||
    snapshot.standalone ||
    !snapshot.secure
  )
    return "unavailable";
  const event = deferred;
  deferred = undefined;
  publish({ busy: true, nativeReady: false });
  document.documentElement.dataset.pwaInstallActive = "true";
  try {
    const response = await event.prompt();
    const choice = response ?? (await event.userChoice);
    if (!choice) return "error";
    if (choice.outcome === "accepted") publish({ requested: true });
    dismissPwaInvitation();
    return choice.outcome;
  } catch {
    return "error";
  } finally {
    delete document.documentElement.dataset.pwaInstallActive;
    publish({ busy: false });
  }
}
