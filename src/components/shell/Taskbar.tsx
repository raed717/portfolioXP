"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "@/components/ui/Icon";
import { START_LABEL } from "@/data/accounts";
import type { LayoutMode } from "@/hooks/useBreakpoint";
import { focusWindowElement } from "@/hooks/useGlobalShortcuts";
import { useWindows } from "@/store/windows";
import { Tray } from "./Tray";
import styles from "./Taskbar.module.css";

type Props = {
  mode: LayoutMode;
  startOpen: boolean;
  onToggleStart: () => void;
  startButtonRef: RefObject<HTMLButtonElement | null>;
};

/** Taskbar (§5.2): Start, one button per window (or a switcher on mobile), tray. */
export function Taskbar({ mode, startOpen, onToggleStart, startButtonRef }: Props) {
  return (
    <nav className={styles.taskbar} aria-label="Taskbar">
      <button
        ref={startButtonRef}
        type="button"
        className={styles.start}
        aria-haspopup="menu"
        aria-expanded={startOpen}
        aria-controls="start-menu"
        onClick={onToggleStart}
      >
        <Icon name="logo" size={16} />
        <span>{START_LABEL}</span>
      </button>
      {mode === "mobile" ? <WindowSwitcher /> : <TaskList />}
      <Tray />
    </nav>
  );
}

function TaskList() {
  const windows = useWindows((s) => s.windows);
  const toggle = useWindows((s) => s.toggleFromTaskbar);

  return (
    <ul className={styles.tasks} aria-label="Open windows">
      {windows.map((w) => {
        const active = w.isFocused && !w.isMinimized;
        return (
          <li key={w.id} className={styles.taskItem}>
            <button
              type="button"
              className={clsx(styles.task, active && styles.taskActive)}
              aria-pressed={active}
              title={w.title}
              onClick={() => toggle(w.id)}
            >
              <Icon name={w.icon} size={16} />
              <span className={styles.taskLabel}>{w.title}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Mobile: a single button that lists open windows (§9). */
function WindowSwitcher() {
  const windows = useWindows((s) => s.windows);
  const focus = useWindows((s) => s.focus);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const top = windows.find((w) => w.isFocused && !w.isMinimized);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (windows.length === 0) return <div className={styles.tasks} />;

  return (
    <div ref={rootRef} className={styles.switcher}>
      <button
        type="button"
        className={clsx(styles.task, styles.taskActive)}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.preventDefault();
            setOpen(false);
          }
        }}
      >
        <Icon name={top?.icon ?? "exe"} size={16} />
        <span className={styles.taskLabel}>{top ? top.title : "Open windows"}</span>
        <span className={styles.badge}>{windows.length}</span>
      </button>
      {open && (
        <ul className={styles.switcherMenu} role="menu" aria-label="Switch window">
          {[...windows].reverse().map((w) => (
            <li key={w.id} role="none">
              <button
                type="button"
                role="menuitem"
                className={styles.switcherItem}
                onClick={() => {
                  focus(w.id);
                  setOpen(false);
                  focusWindowElement(w.id);
                }}
              >
                <Icon name={w.icon} size={16} />
                <span className={styles.taskLabel}>{w.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
