"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import { APPS } from "@/apps/registry";
import { Icon } from "@/components/ui/Icon";
import type { LayoutMode } from "@/hooks/useBreakpoint";
import { clampWindowPosition } from "@/lib/layout";
import { useWindows, type WindowState } from "@/store/windows";
import styles from "./Window.module.css";

type Props = {
  win: WindowState;
  mode: LayoutMode;
  /** Space available for windows (viewport minus taskbar). */
  area: { width: number; height: number };
  children: ReactNode;
};

/** Window chrome (§5.1): drag by title bar, resize from edges, focus on click, mobile full-screen. */
export function Window({ win, mode, area, children }: Props) {
  const focus = useWindows((s) => s.focus);
  const close = useWindows((s) => s.close);
  const minimize = useWindows((s) => s.minimize);
  const toggleMaximize = useWindows((s) => s.toggleMaximize);
  const move = useWindows((s) => s.move);
  const resize = useWindows((s) => s.resize);
  const frameRef = useRef<HTMLDivElement>(null);
  /** True while dragging/resizing, so embedded iframes can't swallow pointer events. */
  const [interacting, setInteracting] = useState(false);

  const app = APPS[win.appId];
  const isDialog = app.kind === "dialog";
  const isMobile = mode === "mobile";
  const fullscreen = isMobile || win.isMaximized;
  const maximizable = !isDialog && app.resizable && !isMobile;
  const titleId = `${win.id}-title`;

  // Dialogs size to their content; everything else uses its stored size, capped to the screen.
  const autoHeight = isDialog && !fullscreen;
  const size = fullscreen
    ? area
    : {
        width: Math.min(win.width, area.width),
        height: autoHeight ? ("auto" as const) : Math.min(win.height, area.height),
      };
  const position = fullscreen
    ? { x: 0, y: 0 }
    : clampWindowPosition({ x: win.x, y: win.y }, size.width, area);

  // Move keyboard focus into a new window unless its content already grabbed it (e.g. an autoFocus button).
  useEffect(() => {
    const frame = frameRef.current;
    if (frame && !frame.contains(document.activeElement)) frame.focus({ preventScroll: true });
  }, []);

  return (
    <Rnd
      size={size}
      position={position}
      minWidth={Math.min(win.minWidth, area.width)}
      minHeight={autoHeight ? undefined : Math.min(win.minHeight, area.height)}
      dragHandleClassName={styles.titlebar}
      cancel={`.${styles.controls}, .${styles.back}`}
      disableDragging={fullscreen}
      enableResizing={app.resizable && !fullscreen}
      onDragStart={() => {
        focus(win.id);
        setInteracting(true);
      }}
      onDragStop={(_, d) => {
        setInteracting(false);
        move(win.id, clampWindowPosition(d, size.width, area));
      }}
      onResizeStart={() => {
        focus(win.id);
        setInteracting(true);
      }}
      onResizeStop={(_, __, ref, ___, pos) => {
        setInteracting(false);
        resize(win.id, { width: ref.offsetWidth, height: ref.offsetHeight, ...pos });
      }}
      style={{ zIndex: win.zIndex, pointerEvents: win.isMinimized ? "none" : "auto" }}
    >
      <div
        ref={frameRef}
        data-window-id={win.id}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-hidden={win.isMinimized || undefined}
        inert={win.isMinimized}
        tabIndex={-1}
        className={clsx(
          styles.window,
          win.isFocused && styles.active,
          win.isMinimized && styles.minimized,
          fullscreen && styles.fullscreen,
        )}
        onPointerDownCapture={() => focus(win.id)}
      >
        <div
          className={styles.titlebar}
          onDoubleClick={maximizable ? () => toggleMaximize(win.id) : undefined}
        >
          {isMobile ? (
            <button
              type="button"
              className={styles.back}
              aria-label={`Back (close ${win.title})`}
              onClick={() => close(win.id)}
            >
              <BackGlyph />
            </button>
          ) : (
            <Icon name={win.icon} size={16} className={styles.titleIcon} />
          )}
          <span id={titleId} className={styles.title}>
            {win.title}
          </span>
          <div className={styles.controls} onDoubleClick={(e) => e.stopPropagation()}>
            {!isDialog && (
              <button
                type="button"
                className={styles.control}
                aria-label={`Minimize ${win.title}`}
                onClick={() => minimize(win.id)}
              >
                <MinimizeGlyph />
              </button>
            )}
            {maximizable && (
              <button
                type="button"
                className={styles.control}
                aria-label={`${win.isMaximized ? "Restore" : "Maximize"} ${win.title}`}
                onClick={() => toggleMaximize(win.id)}
              >
                {win.isMaximized ? <RestoreGlyph /> : <MaximizeGlyph />}
              </button>
            )}
            {!isMobile && (
              <button
                type="button"
                className={clsx(styles.control, styles.close)}
                aria-label={`Close ${win.title}`}
                onClick={() => close(win.id)}
              >
                <CloseGlyph />
              </button>
            )}
          </div>
        </div>
        <div className={styles.body}>
          {children}
          {/* Clicks inside an iframe never reach this document: a shield lets the first click focus the window. */}
          {((app.embedsFrame && !win.isFocused) || interacting) && (
            <div className={styles.shield} aria-hidden onPointerDown={() => focus(win.id)} />
          )}
        </div>
      </div>
    </Rnd>
  );
}

const glyph = { width: 11, height: 11, viewBox: "0 0 11 11", "aria-hidden": true } as const;

function MinimizeGlyph() {
  return (
    <svg {...glyph}>
      <rect x="1" y="8" width="6" height="2.5" fill="currentColor" />
    </svg>
  );
}

function MaximizeGlyph() {
  return (
    <svg {...glyph}>
      <rect x="1" y="1" width="9" height="9" fill="none" stroke="currentColor" />
      <rect x="1" y="1" width="9" height="2.5" fill="currentColor" />
    </svg>
  );
}

function RestoreGlyph() {
  return (
    <svg {...glyph}>
      <rect x="3.5" y="0.5" width="7" height="6" fill="none" stroke="currentColor" />
      <rect x="0.5" y="4.5" width="7" height="6" fill="none" stroke="currentColor" />
      <rect x="0.5" y="4.5" width="7" height="2" fill="currentColor" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg {...glyph}>
      <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BackGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M11 3L5 9l6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
