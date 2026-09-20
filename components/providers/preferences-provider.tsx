"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  setDataSaver,
  setLocale,
  setTheme,
  subscribe,
  type PreferencesSnapshot,
} from "@/lib/preferences-store";

type PreferencesValue = PreferencesSnapshot & {
  setTheme: typeof setTheme;
  setDataSaver: typeof setDataSaver;
  setLocale: typeof setLocale;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

/**
 * Exposes the two reader preferences (theme, data saver) to the tree.
 * State lives in `lib/preferences-store.ts`; this provider only publishes it.
 */
export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return (
    <PreferencesContext.Provider
      value={{ ...snapshot, setTheme, setDataSaver, setLocale }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      "usePreferences doit être utilisé dans un <PreferencesProvider>."
    );
  }
  return context;
}
