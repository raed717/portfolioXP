"use client";

import { useRef, type MouseEvent, type PointerEvent } from "react";
import { useContextMenu, type MenuItem } from "@/store/contextMenu";

const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE = 10;

/**
 * Right-click and touch long-press both open the context menu (§5.4, §9).
 * Spread the returned handlers onto the element. `getItems` runs lazily at open time.
 */
export function useContextMenuTrigger(getItems: () => MenuItem[]) {
  const open = useContextMenu((s) => s.open);
  const press = useRef<{ timer: number; x: number; y: number } | null>(null);
  /** Set when a long-press opened the menu, so the tap that follows doesn't also open the item. */
  const fired = useRef(false);

  const cancel = () => {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  };

  return {
    onContextMenu(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      cancel();
      open(e.clientX, e.clientY, getItems());
    },
    onPointerDown(e: PointerEvent) {
      if (e.pointerType !== "touch") return;
      fired.current = false;
      const { clientX: x, clientY: y } = e;
      cancel();
      press.current = {
        x,
        y,
        timer: window.setTimeout(() => {
          press.current = null;
          fired.current = true;
          open(x, y, getItems());
        }, LONG_PRESS_MS),
      };
    },
    onPointerMove(e: PointerEvent) {
      const p = press.current;
      if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_TOLERANCE) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onClickCapture(e: MouseEvent) {
      if (!fired.current) return;
      fired.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
  };
}
