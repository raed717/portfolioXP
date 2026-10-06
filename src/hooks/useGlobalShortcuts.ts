"use client";

import { useEffect } from "react";
import { APPS } from "@/apps/registry";
import { useWindows } from "@/store/windows";

export function focusWindowElement(id: string) {
  document.querySelector<HTMLElement>(`[data-window-id="${id}"]`)?.focus({ preventScroll: true });
}

/**
 * Desktop keyboard shortcuts (§5.1, §10). Menus handle their own Esc and call preventDefault,
 * so this only acts on events nobody else consumed.
 * Alt+F4 / Alt+Tab are best effort: most browsers and OSes keep those keys for themselves.
 */
export function useGlobalShortcuts({ onToggleStart }: { onToggleStart: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented) return;
      const store = useWindows.getState();
      const focused = store.windows.find((w) => w.isFocused && !w.isMinimized);

      if (e.altKey && e.key === "F4" && focused) {
        e.preventDefault();
        store.close(focused.id);
      } else if (e.altKey && (e.key === "Tab" || e.key === "`")) {
        e.preventDefault();
        store.cycleFocus();
        const next = useWindows.getState().windows.find((w) => w.isFocused);
        if (next) focusWindowElement(next.id);
      } else if (e.ctrlKey && e.key === "Escape") {
        e.preventDefault();
        onToggleStart();
      } else if (e.key === "Escape" && focused && APPS[focused.appId].kind === "dialog") {
        e.preventDefault();
        store.close(focused.id);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onToggleStart]);
}
