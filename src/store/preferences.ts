/** User preferences (§2, §7.7, §11.6). Persisted to localStorage with safe fallbacks. */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ThemeId } from "@/lib/themes";

export type Preferences = {
  theme: ThemeId;
  wallpaper: string;
  /** Sounds are opt-in (§2.4). */
  soundEnabled: boolean;
  /** User override; `null` follows the OS `prefers-reduced-motion`. */
  reduceMotion: boolean | null;
  sidekickDismissed: boolean;
  /** Screensaver after 60s idle (§7.6); also disabled whenever reduced motion applies. */
  screensaverEnabled: boolean;
};

type PreferencesStore = Preferences & {
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  reset: () => void;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "luna",
  wallpaper: "meadow",
  soundEnabled: false,
  reduceMotion: null,
  sidekickDismissed: false,
  screensaverEnabled: true,
};

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const usePreferences = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setPreference: (key, value) => set({ [key]: value } as Partial<Preferences>),
      reset: () => set(DEFAULT_PREFERENCES),
    }),
    {
      name: "portfolioxp:prefs",
      version: 2,
      // v1 called the photo wallpaper "hills"; that id now means the original SVG.
      migrate: (persisted, version) => {
        const prefs = { ...DEFAULT_PREFERENCES, ...(persisted as Partial<Preferences>) };
        if (version < 2 && prefs.wallpaper === "hills") prefs.wallpaper = "meadow";
        return prefs as PreferencesStore;
      },
      storage: createJSONStorage(() => {
        try {
          return window.localStorage;
        } catch {
          return noopStorage;
        }
      }),
    },
  ),
);
