"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { Icon } from "@/components/ui/Icon";
import { projects, person } from "@/data";
import { ACCOUNTS } from "@/data/accounts";
import { PATHS } from "@/data/fs";
import { openApp, openPath } from "@/lib/launcher";
import { findNeighbor, isArrowKey } from "@/lib/spatialNav";
import { useSession } from "@/store/session";
import { useWindows } from "@/store/windows";
import styles from "./StartMenu.module.css";

type Entry = { label: string; hint?: string; icon: string; run: () => void };

const PINNED: Entry[] = [
  { label: "Resume", hint: "My CV", icon: "pdf", run: () => openPath(PATHS.resume) },
  {
    label: "Command Prompt",
    hint: "For fellow devs",
    icon: "terminal",
    run: () => openApp("terminal"),
  },
  { label: "Web Voyager", hint: "Live demos", icon: "browser", run: () => openApp("browser") },
  { label: "Contact Me", hint: "Send a message", icon: "mail", run: () => openApp("mail") },
  { label: "about_me.txt", icon: "txt", run: () => openPath(PATHS.aboutMe) },
];

const PLACES: Entry[] = [
  { label: "My Documents", icon: "folder-documents", run: () => openPath(PATHS.documents) },
  { label: "My Projects", icon: "folder", run: () => openPath(PATHS.projects) },
  { label: "My Computer", icon: "computer", run: () => openApp("sysinfo") },
  { label: "Control Panel", icon: "control-panel", run: () => openApp("controlpanel") },
  { label: "Contact", icon: "mail", run: () => openApp("mail") },
];

const ALL_PROGRAMS: Entry[] = [
  ...projects.map((p) => ({
    label: p.title,
    icon: "folder",
    run: () => openPath(`${PATHS.projects}/${p.title}`),
  })),
  { label: "Explorer", icon: "folder-open", run: () => openPath(PATHS.documents) },
  { label: "Notepad", icon: "txt", run: () => openPath(PATHS.aboutMe) },
  { label: "Command Prompt", icon: "terminal", run: () => openApp("terminal") },
  { label: "Web Voyager", icon: "browser", run: () => openApp("browser") },
  { label: "Mail", icon: "mail", run: () => openApp("mail") },
  { label: "My Computer", icon: "computer", run: () => openApp("sysinfo") },
  { label: "Control Panel", icon: "control-panel", run: () => openApp("controlpanel") },
  { label: "Minesweeper", icon: "mine", run: () => openApp("minesweeper") },
];

type Props = {
  onClose: (restoreFocus?: boolean) => void;
  onTurnOff: () => void;
  startButtonRef: RefObject<HTMLButtonElement | null>;
};

/** Two-column Start menu (§5.3). Arrow keys move between items, Esc closes, outside click closes. */
export function StartMenu({ onClose, onTurnOff, startButtonRef }: Props) {
  const persona = useSession((s) => s.persona);
  const logOff = useSession((s) => s.logOff);
  const closeAll = useWindows((s) => s.closeAll);
  const [allPrograms, setAllPrograms] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const account = ACCOUNTS.find((a) => a.persona === persona) ?? ACCOUNTS[2];

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  // Focus the first item on open and whenever the left column switches views.
  useEffect(() => {
    items()[0]?.focus();
  }, [allPrograms]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !startButtonRef.current?.contains(target)) {
        onClose(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose, startButtonRef]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose(true);
      return;
    }
    const current = document.activeElement as HTMLElement | null;
    const all = items();
    if (!current || !all.includes(current)) return;
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      (e.key === "Home" ? all[0] : all[all.length - 1]).focus();
    } else if (isArrowKey(e.key)) {
      e.preventDefault();
      const next = findNeighbor(current, all, e.key);
      if (next) next.focus();
      else if (e.key === "ArrowDown") all[0].focus();
      else if (e.key === "ArrowUp") all[all.length - 1].focus();
    }
  }

  function run(entry: Entry) {
    entry.run();
    onClose(false);
  }

  return (
    <div
      ref={menuRef}
      id="start-menu"
      className={styles.menu}
      role="menu"
      aria-label="Start menu"
      onKeyDown={onKeyDown}
    >
      <header className={styles.header}>
        <Icon name={account.icon} size={48} className={styles.avatar} />
        <div>
          <p className={styles.user}>{account.name}</p>
          <p className={styles.subtitle}>Visiting {person.name}</p>
        </div>
      </header>

      <div className={styles.columns}>
        <div className={styles.left}>
          {allPrograms ? (
            <>
              <MenuButton
                entry={{ label: "Back", icon: "programs", run: () => setAllPrograms(false) }}
                onRun={(e) => e.run()}
                className={styles.back}
              />
              <div className={styles.scroll}>
                {ALL_PROGRAMS.map((entry) => (
                  <MenuButton key={entry.label + entry.icon} entry={entry} onRun={run} compact />
                ))}
              </div>
            </>
          ) : (
            <>
              {PINNED.map((entry) => (
                <MenuButton key={entry.label} entry={entry} onRun={run} />
              ))}
              <hr className={styles.separator} />
              <MenuButton
                entry={{ label: "All Programs", icon: "programs", run: () => setAllPrograms(true) }}
                onRun={(e) => e.run()}
                className={styles.allPrograms}
              />
            </>
          )}
        </div>

        <div className={styles.right}>
          {PLACES.map((entry) => (
            <MenuButton key={entry.label} entry={entry} onRun={run} place />
          ))}
          <hr className={styles.separator} />
          <a
            role="menuitem"
            tabIndex={-1}
            className={clsx(styles.item, styles.place)}
            href={person.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onClose(false)}
          >
            <Icon name="repo" size={24} />
            <span className={styles.label}>GitHub</span>
          </a>
          <Link
            role="menuitem"
            tabIndex={-1}
            className={clsx(styles.item, styles.place)}
            href="/cv"
          >
            <Icon name="properties" size={24} />
            <span className={styles.label}>Quick View CV</span>
          </Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          role="menuitem"
          tabIndex={-1}
          className={styles.footerButton}
          onClick={() => {
            onClose(false);
            closeAll();
            logOff();
          }}
        >
          <Icon name="logoff" size={24} />
          Log Off
        </button>
        <button
          type="button"
          role="menuitem"
          tabIndex={-1}
          className={styles.footerButton}
          onClick={() => {
            onClose(false);
            onTurnOff();
          }}
        >
          <Icon name="power" size={24} />
          Turn Off
        </button>
      </footer>
    </div>
  );
}

function MenuButton({
  entry,
  onRun,
  compact,
  place,
  className,
}: {
  entry: Entry;
  onRun: (entry: Entry) => void;
  compact?: boolean;
  place?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={clsx(styles.item, place && styles.place, compact && styles.compact, className)}
      onClick={() => onRun(entry)}
    >
      <Icon name={entry.icon} size={compact ? 16 : place ? 24 : 32} />
      <span className={styles.label}>
        {entry.label}
        {entry.hint && !compact && <small className={styles.hint}>{entry.hint}</small>}
      </span>
    </button>
  );
}
