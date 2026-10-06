"use client";

import clsx from "clsx";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./Tabs.module.css";

export type Tab = { id: string; label: string; content: ReactNode };

/** XP property-sheet tabs with the WAI-ARIA tabs pattern (arrow keys, Home/End). */
export function Tabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((t) => t.id === current.id);
    const next =
      e.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : e.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? tabs.length - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(tabs[next].id);
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <div className={styles.tabs}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        className={styles.list}
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={tab.id === current.id}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={tab.id === current.id ? 0 : -1}
            className={clsx(styles.tab, tab.id === current.id && styles.active)}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${current.id}`}
        aria-labelledby={`${baseId}-tab-${current.id}`}
        tabIndex={0}
        className={styles.panel}
      >
        {current.content}
      </div>
    </div>
  );
}
