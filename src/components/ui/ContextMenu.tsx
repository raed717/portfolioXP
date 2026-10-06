"use client";

import clsx from "clsx";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { useContextMenu, type MenuAction } from "@/store/contextMenu";
import styles from "./ContextMenu.module.css";

/** Renders the open context menu (§5.4). Esc, outside click, scroll or resize close it. */
export function ContextMenu() {
  const menu = useContextMenu((s) => s.menu);
  const close = useContextMenu((s) => s.close);
  const ref = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  // Keep the menu fully on screen: flip left/up when it would overflow.
  useLayoutEffect(() => {
    if (!menu || !ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    const left = menu.x + width > window.innerWidth ? Math.max(0, menu.x - width) : menu.x;
    const top = menu.y + height > window.innerHeight ? Math.max(0, menu.y - height) : menu.y;
    setPosition({ left, top });
    ref.current.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", close);
    window.addEventListener("wheel", close);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("wheel", close);
    };
  }, [menu, close]);

  if (!menu) return null;

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    const buttons = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [],
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      buttons[(index + step + buttons.length) % buttons.length]?.focus();
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  }

  function select(item: MenuAction) {
    close();
    item.onSelect();
  }

  return (
    <ul
      ref={ref}
      role="menu"
      aria-label="Context menu"
      className={styles.menu}
      style={
        position
          ? { left: position.left, top: position.top }
          : { left: menu.x, top: menu.y, visibility: "hidden" }
      }
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menu.items.map((item, i) =>
        item === "separator" ? (
          <li key={`sep-${i}`} role="separator" className={styles.separator} />
        ) : (
          <li key={item.label} role="none">
            <button
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={clsx(styles.item, item.isDefault && styles.default)}
              onClick={() => select(item)}
            >
              {item.label}
            </button>
          </li>
        ),
      )}
    </ul>
  );
}
