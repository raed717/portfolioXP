"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { DESKTOP_SHORTCUTS, type DesktopShortcut } from "@/data/desktop";
import type { LayoutMode } from "@/hooks/useBreakpoint";
import { useContextMenuTrigger } from "@/hooks/useContextMenuTrigger";
import { openApp, openPath, openProperties, showMessage } from "@/lib/launcher";
import { findNeighbor, isArrowKey } from "@/lib/spatialNav";
import type { MenuItem } from "@/store/contextMenu";
import styles from "./DesktopIcons.module.css";

const READ_ONLY_DESKTOP =
  "This desktop is read-only, so nothing new can be created here. If you'd like to build something new together, the Contact Me icon is the way.";

/**
 * Desktop icon grid (§4.3): click selects, double-click opens, a tap opens on touch.
 * Roving tabindex + arrow keys; Enter opens (§10). Right-click / long-press opens menus (§5.4).
 */
export function DesktopIcons({ mode }: { mode: LayoutMode }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const gridRef = useRef<HTMLUListElement>(null);

  function activate(shortcut: DesktopShortcut) {
    const { target } = shortcut;
    if (target.type === "path") openPath(target.path);
    else if (target.type === "app") openApp(target.appId);
    else router.push(target.href);
  }

  function properties(shortcut: DesktopShortcut) {
    if (shortcut.target.type === "path") {
      openProperties({ kind: "path", path: shortcut.target.path });
    } else {
      openProperties({
        kind: "shortcut",
        name: shortcut.label,
        icon: shortcut.icon,
        description: shortcut.tooltip,
      });
    }
  }

  const desktopMenu = useContextMenuTrigger(() => [
    {
      label: "Refresh",
      onSelect: () => {
        setSelected(null);
        setRefreshKey((k) => k + 1);
      },
    },
    "separator",
    { label: "New Folder", onSelect: () => showMessage("New Folder", READ_ONLY_DESKTOP, "info") },
    {
      label: "New Text Document",
      onSelect: () => showMessage("New Text Document", READ_ONLY_DESKTOP, "info"),
    },
    "separator",
    { label: "Properties", onSelect: () => openApp("controlpanel") },
  ]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, shortcut: DesktopShortcut) {
    if (e.key === "Enter") {
      e.preventDefault();
      activate(shortcut);
    } else if (isArrowKey(e.key) && gridRef.current) {
      e.preventDefault();
      const buttons = Array.from(gridRef.current.querySelectorAll<HTMLButtonElement>("button"));
      findNeighbor(e.currentTarget, buttons, e.key)?.focus();
    }
  }

  const focusable = selected ?? DESKTOP_SHORTCUTS[0].id;

  return (
    <ul
      key={refreshKey}
      ref={gridRef}
      className={styles.grid}
      aria-label="Desktop"
      {...desktopMenu}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      {DESKTOP_SHORTCUTS.map((shortcut) => (
        <DesktopIcon
          key={shortcut.id}
          shortcut={shortcut}
          selected={selected === shortcut.id}
          focusable={focusable === shortcut.id}
          tapOpens={mode === "mobile"}
          onSelect={() => setSelected(shortcut.id)}
          onOpen={() => activate(shortcut)}
          onKeyDown={(e) => onKeyDown(e, shortcut)}
          getMenu={() => [
            { label: "Open", isDefault: true, onSelect: () => activate(shortcut) },
            "separator",
            { label: "Properties", onSelect: () => properties(shortcut) },
          ]}
        />
      ))}
    </ul>
  );
}

type IconProps = {
  shortcut: DesktopShortcut;
  selected: boolean;
  focusable: boolean;
  tapOpens: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  getMenu: () => MenuItem[];
};

function DesktopIcon({
  shortcut,
  selected,
  focusable,
  tapOpens,
  onSelect,
  onOpen,
  onKeyDown,
  getMenu,
}: IconProps) {
  const lastPointer = useRef("mouse");
  const menu = useContextMenuTrigger(() => {
    onSelect();
    return getMenu();
  });

  return (
    <li className={styles.cell}>
      <button
        type="button"
        className={clsx(styles.icon, selected && styles.selected)}
        title={shortcut.tooltip}
        tabIndex={focusable ? 0 : -1}
        {...menu}
        onFocus={onSelect}
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
          menu.onPointerDown(e);
        }}
        onClick={() => {
          if (tapOpens || lastPointer.current === "touch") onOpen();
          else onSelect();
        }}
        onDoubleClick={() => {
          if (!tapOpens && lastPointer.current !== "touch") onOpen();
        }}
        onKeyDown={onKeyDown}
      >
        <Icon name={shortcut.icon} size={32} className={styles.image} />
        <span className={styles.label}>{shortcut.label}</span>
      </button>
    </li>
  );
}
