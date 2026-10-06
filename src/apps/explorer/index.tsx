"use client";

import clsx from "clsx";
import { useRef, useState, type KeyboardEvent } from "react";
import type { AppProps } from "@/apps/types";
import { Icon } from "@/components/ui/Icon";
import { PATHS, fsRoot } from "@/data/fs";
import { useContextMenuTrigger } from "@/hooks/useContextMenuTrigger";
import { useLayoutMode } from "@/hooks/useBreakpoint";
import { fromDisplayPath, iconFor, sizeLabel, toDisplayPath, typeLabel } from "@/lib/fileInfo";
import { openApp, openPath, openProperties, showMessage } from "@/lib/launcher";
import { findNeighbor, isArrowKey } from "@/lib/spatialNav";
import { canonicalPath, getNode, resolvePath, type FolderNode, type VNode } from "@/lib/vfs";
import type { MenuItem } from "@/store/contextMenu";
import { useWindows } from "@/store/windows";
import styles from "./explorer.module.css";

type View = "icons" | "details";
type History = { stack: string[]; index: number };

const EMPTY_MESSAGES: Record<string, string> = {
  [PATHS.recycleBin]:
    "The Recycle Bin is empty. Every idea in here either shipped or is still cooking.",
};

/** File browser over the virtual file system (§6). Params: { path: string }. */
export default function ExplorerApp({ windowId, params }: AppProps) {
  const update = useWindows((s) => s.update);
  const mode = useLayoutMode();
  const initial =
    canonicalPath(fsRoot, typeof params?.path === "string" ? params.path : "/") ?? "/";
  const [history, setHistory] = useState<History>({ stack: [initial], index: 0 });
  const [view, setView] = useState<View>("icons");
  const [selected, setSelected] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const path = history.stack[history.index];
  const folder = getNode(fsRoot, path) as FolderNode;
  const children = folder.children;
  const selectedNode = children.find((c) => c.name === selected) ?? null;
  const projectSlug = folder.meta?.projectSlug;
  const hasDemo = children.some((c) => c.name === "demo.exe");

  function show(next: string, nextHistory: History) {
    const node = getNode(fsRoot, next);
    setHistory(nextHistory);
    setSelected(null);
    update(windowId, {
      title: node?.name || "Desktop",
      icon: node ? iconFor(node) : "folder-open",
      params: { path: next },
    });
  }

  function navigate(target: string) {
    const next = canonicalPath(fsRoot, target);
    const node = next === null ? null : getNode(fsRoot, next);
    if (next === null || !node) {
      showMessage("Address not found", `I can't find "${toDisplayPath(target)}".`, "error");
      return;
    }
    if (node.type === "file") {
      openPath(next);
      return;
    }
    if (next === path) return;
    const stack = [...history.stack.slice(0, history.index + 1), next];
    show(next, { stack, index: stack.length - 1 });
  }

  const go = (delta: number) => {
    const index = history.index + delta;
    if (index >= 0 && index < history.stack.length)
      show(history.stack[index], { ...history, index });
  };
  const up = () => path !== "/" && navigate(resolvePath(path, ".."));
  const childPath = (child: VNode) => resolvePath(path, child.name);

  function open(child: VNode) {
    if (child.type === "folder") navigate(childPath(child));
    else openPath(childPath(child));
  }

  function itemMenu(child: VNode): MenuItem[] {
    return [
      { label: "Open", isDefault: true, onSelect: () => open(child) },
      "separator",
      {
        label: "Properties",
        onSelect: () => openProperties({ kind: "path", path: childPath(child) }),
      },
    ];
  }

  const backgroundMenu = useContextMenuTrigger(() => [
    { label: "View: Icons", disabled: view === "icons", onSelect: () => setView("icons") },
    { label: "View: Details", disabled: view === "details", onSelect: () => setView("details") },
    "separator",
    { label: "Up One Level", disabled: path === "/", onSelect: up },
    { label: "Properties", onSelect: () => openProperties({ kind: "path", path }) },
  ]);

  function onRootKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === "Backspace" || (e.altKey && e.key === "ArrowUp")) {
      e.preventDefault();
      up();
    } else if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.altKey && e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  function onItemKeyDown(e: KeyboardEvent<HTMLLIElement>, child: VNode) {
    if (e.key === "Enter") {
      e.preventDefault();
      open(child);
    } else if (isArrowKey(e.key) && !e.altKey && listRef.current) {
      e.preventDefault();
      const items = Array.from(listRef.current.querySelectorAll<HTMLLIElement>('[role="option"]'));
      findNeighbor(e.currentTarget, items, e.key)?.focus();
    }
  }

  const focusable = selected ?? children[0]?.name;
  const tapOpens = mode === "mobile";

  return (
    <div className={styles.explorer} onKeyDown={onRootKeyDown}>
      <div className={styles.toolbar} role="toolbar" aria-label="Navigation">
        <button
          type="button"
          className={styles.tool}
          disabled={history.index === 0}
          onClick={() => go(-1)}
          aria-label="Back"
        >
          <Icon name="nav-back" size={24} />
          <span className={styles.toolLabel}>Back</span>
        </button>
        <button
          type="button"
          className={styles.tool}
          disabled={history.index >= history.stack.length - 1}
          onClick={() => go(1)}
          aria-label="Forward"
        >
          <Icon name="nav-forward" size={24} />
        </button>
        <button
          type="button"
          className={styles.tool}
          disabled={path === "/"}
          onClick={up}
          aria-label="Up one level"
        >
          <Icon name="nav-up" size={24} />
        </button>
        <span className={styles.toolSeparator} aria-hidden />
        <button
          type="button"
          className={styles.tool}
          aria-pressed={view === "details"}
          onClick={() => setView(view === "icons" ? "details" : "icons")}
          aria-label={view === "icons" ? "Switch to details view" : "Switch to icons view"}
        >
          <Icon name="views" size={24} />
          <span className={styles.toolLabel}>Views</span>
        </button>
      </div>

      <AddressBar key={path} path={path} onGo={navigate} />

      <div className={styles.main}>
        <aside className={styles.tasks} aria-label="Tasks">
          {projectSlug !== undefined && (
            <TaskGroup title="Project Tasks">
              <TaskLink icon="properties" onClick={() => openProperties({ kind: "path", path })}>
                View project details
              </TaskLink>
              {hasDemo && (
                <TaskLink icon="browser" onClick={() => openPath(resolvePath(path, "demo.exe"))}>
                  Launch live demo
                </TaskLink>
              )}
            </TaskGroup>
          )}
          <TaskGroup title="Other Places">
            <TaskLink icon="folder-documents" onClick={() => navigate(PATHS.documents)}>
              My Documents
            </TaskLink>
            <TaskLink icon="folder" onClick={() => navigate(PATHS.projects)}>
              My Projects
            </TaskLink>
            <TaskLink icon="computer" onClick={() => openApp("sysinfo")}>
              My Computer
            </TaskLink>
            <TaskLink icon="logo" onClick={() => navigate("/")}>
              Desktop
            </TaskLink>
          </TaskGroup>
          {selectedNode && (
            <TaskGroup title="Details">
              <p className={styles.detailName}>{selectedNode.name}</p>
              <p className={styles.detailMeta}>{typeLabel(selectedNode)}</p>
              {sizeLabel(selectedNode) && (
                <p className={styles.detailMeta}>Size: {sizeLabel(selectedNode)}</p>
              )}
            </TaskGroup>
          )}
        </aside>

        <div
          className={clsx(styles.content, view === "details" && styles.details)}
          {...backgroundMenu}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          {children.length === 0 ? (
            <p className={styles.empty}>{EMPTY_MESSAGES[path] ?? "This folder is empty."}</p>
          ) : (
            <>
              {view === "details" && (
                <div className={styles.header} aria-hidden>
                  <span>Name</span>
                  <span>Type</span>
                  <span>Size</span>
                </div>
              )}
              <ul
                ref={listRef}
                role="listbox"
                aria-label={`Contents of ${folder.name || "Desktop"}`}
                className={styles.items}
              >
                {children.map((child) => (
                  <ExplorerItem
                    key={child.name}
                    node={child}
                    view={view}
                    selected={selected === child.name}
                    focusable={focusable === child.name}
                    tapOpens={tapOpens}
                    onSelect={() => setSelected(child.name)}
                    onOpen={() => open(child)}
                    onKeyDown={(e) => onItemKeyDown(e, child)}
                    getMenu={() => itemMenu(child)}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className={styles.status} role="status">
        <span>
          {children.length} object{children.length === 1 ? "" : "s"}
        </span>
        {selectedNode && <span>{typeLabel(selectedNode)}</span>}
      </div>
    </div>
  );
}

function AddressBar({ path, onGo }: { path: string; onGo: (path: string) => void }) {
  const [draft, setDraft] = useState(toDisplayPath(path));
  return (
    <form
      className={styles.address}
      onSubmit={(e) => {
        e.preventDefault();
        onGo(fromDisplayPath(draft));
      }}
    >
      <label htmlFor={`address-${path}`} className={styles.addressLabel}>
        Address
      </label>
      <input
        id={`address-${path}`}
        className={styles.addressInput}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      <button type="submit" className={styles.go}>
        Go
      </button>
    </form>
  );
}

type ItemProps = {
  node: VNode;
  view: View;
  selected: boolean;
  focusable: boolean;
  tapOpens: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLLIElement>) => void;
  getMenu: () => MenuItem[];
};

function ExplorerItem({
  node,
  view,
  selected,
  focusable,
  tapOpens,
  onSelect,
  onOpen,
  onKeyDown,
  getMenu,
}: ItemProps) {
  const lastPointer = useRef("mouse");
  const menu = useContextMenuTrigger(getMenu);
  return (
    <li
      role="option"
      aria-selected={selected}
      tabIndex={focusable ? 0 : -1}
      className={clsx(styles.item, selected && styles.selected)}
      title={node.name}
      {...menu}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
        menu.onPointerDown(e);
      }}
      onFocus={onSelect}
      onClick={() => {
        if (tapOpens || lastPointer.current === "touch") onOpen();
        else onSelect();
      }}
      onDoubleClick={() => {
        if (!tapOpens && lastPointer.current !== "touch") onOpen();
      }}
      onKeyDown={onKeyDown}
    >
      <Icon name={iconFor(node)} size={view === "icons" ? 32 : 16} />
      <span className={styles.name}>{node.name}</span>
      {view === "details" && (
        <>
          <span className={styles.cell}>{typeLabel(node)}</span>
          <span className={styles.cell}>{sizeLabel(node)}</span>
        </>
      )}
    </li>
  );
}

function TaskGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.taskGroup}>
      <h3 className={styles.taskTitle}>{title}</h3>
      <div className={styles.taskBody}>{children}</div>
    </section>
  );
}

function TaskLink({
  icon,
  onClick,
  children,
}: {
  icon: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={styles.taskLink} onClick={onClick}>
      <Icon name={icon} size={16} />
      <span>{children}</span>
    </button>
  );
}
