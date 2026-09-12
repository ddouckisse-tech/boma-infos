import {
  DATA_SAVER_STORAGE_KEY,
  THEME_STORAGE_KEY,
  isThemeChoice,
  type ResolvedTheme,
  type ThemeChoice,
} from "@/lib/preferences";

/**
 * Tiny external store for the reader preferences, read with
 * `useSyncExternalStore`.
 *
 * The source of truth is the DOM: the blocking inline script in <head> has
 * already applied the stored theme to <html> before React runs. Hydrating
 * from a store (rather than from an effect that calls setState) keeps the
 * server render and the hydrated render consistent, with no extra pass and
 * no flash.
 */

export type PreferencesSnapshot = {
  theme: ThemeChoice;
  resolvedTheme: ResolvedTheme;
  dataSaver: boolean;
  /** False until the DOM has been read — i.e. during SSR and hydration. */
  ready: boolean;
};

const SERVER_SNAPSHOT: PreferencesSnapshot = {
  theme: "system",
  resolvedTheme: "light",
  dataSaver: false,
  ready: false,
};

let snapshot: PreferencesSnapshot = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

const systemTheme = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/** Writes the choice onto <html> and returns what is actually painted. */
const applyTheme = (choice: ThemeChoice): ResolvedTheme => {
  const root = document.documentElement;
  const resolved: ResolvedTheme = choice === "system" ? systemTheme() : choice;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.themeChoice = choice;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  return resolved;
};

const readDom = (): PreferencesSnapshot => {
  const root = document.documentElement;
  const stored = root.dataset.themeChoice;
  return {
    theme: isThemeChoice(stored) ? stored : "system",
    resolvedTheme: root.classList.contains("dark") ? "dark" : "light",
    dataSaver: root.dataset.dataSaver === "on",
    ready: true,
  };
};

const persist = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Navigation privée ou stockage refusé : la préférence reste en mémoire.
  }
};

export const getServerSnapshot = (): PreferencesSnapshot => SERVER_SNAPSHOT;

export const getSnapshot = (): PreferencesSnapshot => {
  if (!hydrated && typeof document !== "undefined") {
    hydrated = true;
    snapshot = readDom();
  }
  return snapshot;
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (snapshot.theme !== "system") return;
    snapshot = { ...snapshot, resolvedTheme: applyTheme("system") };
    emit();
  };
  media.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
  };
};

export const setTheme = (choice: ThemeChoice) => {
  const resolvedTheme = applyTheme(choice);
  snapshot = { ...snapshot, theme: choice, resolvedTheme, ready: true };
  persist(THEME_STORAGE_KEY, choice);
  emit();
};

export const setDataSaver = (enabled: boolean) => {
  document.documentElement.dataset.dataSaver = enabled ? "on" : "off";
  snapshot = { ...snapshot, dataSaver: enabled, ready: true };
  persist(DATA_SAVER_STORAGE_KEY, enabled ? "1" : "0");
  emit();
};
