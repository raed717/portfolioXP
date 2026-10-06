/** Guarded localStorage access (§7.7, §11.6). Never throws; falls back to the provided default. */

const PREFIX = "portfolioxp:";

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Private mode / quota exceeded: preferences simply won't persist.
  }
}

export function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(PREFIX + key, value);
  } catch {
    // Ignore: intro will simply replay.
  }
}
