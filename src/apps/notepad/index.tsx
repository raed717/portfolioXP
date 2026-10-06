"use client";

import { useEffect, useState } from "react";
import type { AppProps } from "@/apps/types";
import { fsRoot } from "@/data/fs";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getNode } from "@/lib/vfs";
import styles from "./notepad.module.css";

const CHARS_PER_TICK = 4;
const TICK_MS = 16;

/**
 * Read-only text viewer for .txt / .ini / .md files. Params: { path: string; typing?: boolean }.
 * `typing` plays a typewriter effect (§6), skipped under reduced motion or on click / key press.
 */
export default function NotepadApp({ params }: AppProps) {
  const path = typeof params?.path === "string" ? params.path : "";
  const node = getNode(fsRoot, path);
  const content =
    node?.type === "file" && typeof node.content === "string"
      ? node.content
      : "This file is empty. Even the bytes left early.";

  const reducedMotion = useReducedMotion();
  const animate = params?.typing === true && !reducedMotion;
  const [shown, setShown] = useState(animate ? 0 : content.length);
  const typing = shown < content.length;

  useEffect(() => {
    if (!typing) return;
    const timer = window.setTimeout(
      () => setShown((n) => Math.min(content.length, n + CHARS_PER_TICK)),
      TICK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [typing, shown, content.length]);

  const finish = () => setShown(content.length);

  return (
    <div
      className={styles.page}
      tabIndex={0}
      aria-label={`Contents of ${node?.name ?? path}`}
      onClick={typing ? finish : undefined}
      onKeyDown={typing ? finish : undefined}
    >
      {/* Screen readers always get the full text; the animation is visual only. */}
      <pre className={styles.text} aria-hidden={typing || undefined}>
        {content.slice(0, shown)}
        {typing && <span className={styles.caret} />}
      </pre>
      {typing && <p className="sr-only-live">{content}</p>}
    </div>
  );
}
