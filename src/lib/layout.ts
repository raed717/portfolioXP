/** Layout constants shared by JS and CSS. Keep in sync with the media queries in styles/tokens.css. */
import type { LayoutMode } from "@/hooks/useBreakpoint";

export const BREAKPOINTS = { tablet: 768, desktop: 1024 } as const;

export const TASKBAR_HEIGHT: Record<LayoutMode, number> = { mobile: 44, tablet: 30, desktop: 30 };

/** Pixels of a window that must stay on screen horizontally so it can be dragged back (§5.1). */
export const MIN_VISIBLE = 80;
export const TITLEBAR_HEIGHT = 26;

export function clampWindowPosition(
  pos: { x: number; y: number },
  width: number,
  area: { width: number; height: number },
): { x: number; y: number } {
  return {
    x: Math.min(Math.max(pos.x, MIN_VISIBLE - width), area.width - MIN_VISIBLE),
    y: Math.min(Math.max(pos.y, 0), Math.max(area.height - TITLEBAR_HEIGHT, 0)),
  };
}

/** Below the desktop breakpoint new windows open maximized (§9). */
export function prefersMaximized(): boolean {
  try {
    return window.matchMedia(`(max-width: ${BREAKPOINTS.desktop - 1}px)`).matches;
  } catch {
    return false;
  }
}
