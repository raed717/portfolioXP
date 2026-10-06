"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { AppProps } from "@/apps/types";
import { person } from "@/data";
import { openApp, openPath } from "@/lib/launcher";
import { HOME, complete, execute, prompt, type Effect, type Line } from "@/lib/terminal";
import { usePreferences } from "@/store/preferences";
import { useWindows } from "@/store/windows";
import styles from "./terminal.module.css";

const BANNER: Line[] = [
  { text: "Portfolio Command Prompt [Version 1.0]" },
  { text: `(C) ${person.name}. Type \`help\` to get started.`, tone: "muted" },
  { text: "" },
];

/** Command-driven navigation of the portfolio (§7.2). Logic lives in lib/terminal. */
export default function TerminalApp({ windowId }: AppProps) {
  const close = useWindows((s) => s.close);
  const theme = usePreferences((s) => s.theme);
  const setPreference = usePreferences((s) => s.setPreference);

  const [lines, setLines] = useState<Line[]>(BANNER);
  const [cwd, setCwd] = useState<string>(HOME);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [lines]);

  function apply(effect: Effect) {
    switch (effect.type) {
      case "openPath":
        openPath(effect.path);
        break;
      case "openApp":
        openApp(effect.appId);
        break;
      case "theme":
        setPreference("theme", effect.theme);
        break;
      case "clear":
        setLines([]);
        break;
      case "exit":
        close(windowId);
        break;
    }
  }

  function submit() {
    const echo: Line = { text: `${prompt(cwd)}${input}`, tone: "command" };
    const result = execute(input, { cwd, theme });
    const clears = result.effects.some((e) => e.type === "clear");
    setLines((prev) => (clears ? [] : [...prev, echo, ...result.lines]));
    setCwd(result.cwd);
    if (input.trim()) setHistory((h) => [...h, input]);
    setHistoryIndex(null);
    setInput("");
    result.effects.filter((e) => e.type !== "clear").forEach(apply);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const { value, options } = complete(input, cwd);
      setInput(value);
      if (options.length > 1) {
        setLines((prev) => [
          ...prev,
          { text: `${prompt(cwd)}${input}`, tone: "command" },
          { text: options.join("   "), tone: "muted" },
        ]);
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      const last = history.length - 1;
      const next =
        e.key === "ArrowUp"
          ? historyIndex === null
            ? last
            : Math.max(0, historyIndex - 1)
          : historyIndex === null || historyIndex >= last
            ? null
            : historyIndex + 1;
      setHistoryIndex(next);
      setInput(next === null ? "" : history[next]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLines([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      if (window.getSelection()?.toString()) return; // Let people copy text.
      e.preventDefault();
      setLines((prev) => [...prev, { text: `${prompt(cwd)}${input}^C`, tone: "command" }]);
      setInput("");
    }
  }

  return (
    <div
      className={styles.terminal}
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      <div ref={outputRef} className={styles.output} role="log" aria-live="polite">
        {lines.map((line, i) => (
          <div key={i} className={clsx(styles.line, line.tone && styles[line.tone])}>
            {line.text || " "}
          </div>
        ))}
        <div className={styles.inputRow}>
          <label htmlFor={`${windowId}-cmd`} className={styles.prompt}>
            {prompt(cwd)}
          </label>
          <input
            ref={inputRef}
            id={`${windowId}-cmd`}
            className={styles.input}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setHistoryIndex(null);
            }}
            onKeyDown={onKeyDown}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Command"
          />
        </div>
      </div>
    </div>
  );
}
