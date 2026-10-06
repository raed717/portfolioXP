/**
 * Window manager store (THEME_CONTEXT.md §5.1).
 * Pure state + actions; dragging/resizing UI lives in components/window and calls `move`/`resize`.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { APPS } from "@/apps/registry";
import type { AppId } from "@/apps/types";

export type WindowState = {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  params?: Record<string, unknown>;
};

export type OpenOptions = {
  title?: string;
  icon?: string;
  params?: Record<string, unknown>;
  maximized?: boolean;
};

type Point = { x: number; y: number };
type Size = { width: number; height: number };

type WindowStore = {
  windows: WindowState[];
  nextZ: number;
  /** Last position per app, reused when the app is opened again (§5.1). Persisted (§7.7). */
  lastPosition: Partial<Record<AppId, Point>>;
  /** Last size per app. Persisted alongside positions; open windows themselves are not. */
  lastSize: Partial<Record<AppId, Size>>;
  /** Forget remembered positions and sizes (Control Panel). */
  resetLayout: () => void;
  open: (appId: AppId, options?: OpenOptions) => string;
  close: (id: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  toggleMaximize: (id: string) => void;
  move: (id: string, pos: Point) => void;
  resize: (id: string, size: Size & Partial<Point>) => void;
  /** Taskbar click: focus if inactive/minimized, minimize if already focused (§5.2). */
  toggleFromTaskbar: (id: string) => void;
  /** Alt+Tab best effort: bring the bottom-most window to the front. */
  cycleFocus: () => void;
  closeAll: () => void;
  /** Programs update their own title/icon/params as the user navigates (e.g. Explorer folders). */
  update: (id: string, patch: Partial<Pick<WindowState, "title" | "icon" | "params">>) => void;
};

export const CASCADE_OFFSET = 24;
const ORIGIN: Point = { x: 48, y: 32 };
const BASE_Z = 10;

let counter = 0;
const newId = (appId: AppId) => `${appId}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Focus the top-most visible window, or nothing. */
function refocusTop(windows: WindowState[]): WindowState[] {
  const top = windows
    .filter((w) => !w.isMinimized)
    .reduce<WindowState | null>((acc, w) => (!acc || w.zIndex > acc.zIndex ? w : acc), null);
  return windows.map((w) => ({ ...w, isFocused: w.id === top?.id }));
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useWindows = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: [],
      nextZ: BASE_Z,
      lastPosition: {},
      lastSize: {},

      open: (appId, options = {}) => {
        const app = APPS[appId];
        const { windows, nextZ, lastPosition, lastSize } = get();
        const size = (app.resizable && lastSize[appId]) || app.defaultSize;

        if (app.singleInstance) {
          const existing = windows.find((w) => w.appId === appId);
          if (existing) {
            if (options.params) {
              set({
                windows: windows.map((w) =>
                  w.id === existing.id ? { ...w, params: options.params } : w,
                ),
              });
            }
            get().focus(existing.id);
            return existing.id;
          }
        }

        const sameApp = windows.filter((w) => w.appId === appId).length;
        const base = lastPosition[appId] ?? {
          x: ORIGIN.x + windows.length * CASCADE_OFFSET,
          y: ORIGIN.y + windows.length * CASCADE_OFFSET,
        };
        const id = newId(appId);
        const win: WindowState = {
          id,
          appId,
          title: options.title ?? app.title,
          icon: options.icon ?? app.icon,
          x: base.x + sameApp * CASCADE_OFFSET,
          y: base.y + sameApp * CASCADE_OFFSET,
          width: size.width,
          height: size.height,
          minWidth: app.minSize?.width ?? app.defaultSize.width,
          minHeight: app.minSize?.height ?? app.defaultSize.height,
          zIndex: nextZ + 1,
          isMinimized: false,
          isMaximized: options.maximized ?? false,
          isFocused: true,
          params: options.params,
        };
        set({
          windows: [...windows.map((w) => ({ ...w, isFocused: false })), win],
          nextZ: nextZ + 1,
        });
        return id;
      },

      close: (id) =>
        set(({ windows }) => ({ windows: refocusTop(windows.filter((w) => w.id !== id)) })),

      focus: (id) =>
        set(({ windows, nextZ }) => {
          const target = windows.find((w) => w.id === id);
          if (!target) return {};
          if (target.isFocused && !target.isMinimized && target.zIndex === nextZ) return {};
          return {
            nextZ: nextZ + 1,
            windows: windows.map((w) =>
              w.id === id
                ? { ...w, zIndex: nextZ + 1, isFocused: true, isMinimized: false }
                : { ...w, isFocused: false },
            ),
          };
        }),

      minimize: (id) =>
        set(({ windows }) => ({
          windows: refocusTop(windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))),
        })),

      restore: (id) => get().focus(id),

      toggleMaximize: (id) => {
        const target = get().windows.find((w) => w.id === id);
        if (!target || APPS[target.appId].kind === "dialog") return;
        set(({ windows }) => ({
          windows: windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)),
        }));
        get().focus(id);
      },

      move: (id, pos) =>
        set(({ windows, lastPosition }) => {
          const target = windows.find((w) => w.id === id);
          if (!target) return {};
          return {
            windows: windows.map((w) => (w.id === id ? { ...w, ...pos } : w)),
            lastPosition: { ...lastPosition, [target.appId]: pos },
          };
        }),

      resize: (id, size) =>
        set(({ windows, lastSize }) => {
          const target = windows.find((w) => w.id === id);
          if (!target) return {};
          const width = Math.max(size.width, target.minWidth);
          const height = Math.max(size.height, target.minHeight);
          return {
            windows: windows.map((w) => (w.id === id ? { ...w, ...size, width, height } : w)),
            lastSize: { ...lastSize, [target.appId]: { width, height } },
          };
        }),

      toggleFromTaskbar: (id) => {
        const win = get().windows.find((w) => w.id === id);
        if (!win) return;
        if (win.isFocused && !win.isMinimized) get().minimize(id);
        else get().focus(id);
      },

      cycleFocus: () => {
        const ordered = [...get().windows].sort((a, b) => a.zIndex - b.zIndex);
        if (ordered.length > 1) get().focus(ordered[0].id);
      },

      closeAll: () => set({ windows: [] }),

      update: (id, patch) =>
        set(({ windows }) => ({
          windows: windows.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        })),

      resetLayout: () => set({ lastPosition: {}, lastSize: {} }),
    }),
    {
      name: "portfolioxp:layout",
      version: 1,
      partialize: ({ lastPosition, lastSize }) => ({ lastPosition, lastSize }),
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
