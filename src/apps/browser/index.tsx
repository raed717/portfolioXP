"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import clsx from "clsx";
import type { AppProps } from "@/apps/types";
import { Icon } from "@/components/ui/Icon";
import { fsRoot } from "@/data/fs";
import {
  DEMOS,
  HOME_URL,
  demoFor,
  hostOf,
  isAllowed,
  isVideoUrl,
  normalizeInput,
  toEmbedUrl,
} from "@/lib/browser";
import { getNode } from "@/lib/vfs";
import { useWindows } from "@/store/windows";
import styles from "./browser.module.css";

type History = { stack: string[]; index: number };

function initialUrl(params: AppProps["params"]): string {
  if (typeof params?.url === "string") return params.url;
  if (typeof params?.path === "string") {
    const node = getNode(fsRoot, params.path);
    const url = node?.type === "file" ? node.meta?.url : undefined;
    if (typeof url === "string") return url;
  }
  return HOME_URL;
}

/**
 * Web Voyager (§6): loads live project demos in a sandboxed iframe.
 * Params: { url } or { path } of a demo.exe. Non-project URLs and sites that refuse framing
 * get a friendly page with "Open in new tab" instead.
 */
export default function BrowserApp({ windowId, params }: AppProps) {
  const update = useWindows((s) => s.update);
  const [history, setHistory] = useState<History>(() => ({
    stack: [initialUrl(params)],
    index: 0,
  }));
  const [reloadKey, setReloadKey] = useState(0);
  const url = history.stack[history.index];
  const demo = demoFor(url);
  const isVideo = isVideoUrl(url);

  function show(next: History) {
    setHistory(next);
    const target = next.stack[next.index];
    const targetDemo = demoFor(target);
    const isVid = isVideoUrl(target);
    const title =
      target === HOME_URL
        ? "Favorites"
        : targetDemo
          ? isVid && targetDemo.liveUrl
            ? `${targetDemo.title} (Video Tour)`
            : targetDemo.title
          : hostOf(target);
    update(windowId, { title: `${title} - Web Voyager`, params: { url: target } });
  }

  function navigate(target: string) {
    const next = normalizeInput(target);
    if (next === url) return setReloadKey((k) => k + 1);
    const stack = [...history.stack.slice(0, history.index + 1), next];
    show({ stack, index: stack.length - 1 });
  }

  const go = (delta: number) => {
    const index = history.index + delta;
    if (index >= 0 && index < history.stack.length) show({ ...history, index });
  };

  return (
    <div className={styles.browser}>
      <div className={styles.toolbar} role="toolbar" aria-label="Browser navigation">
        <ToolButton
          icon="nav-back"
          label="Back"
          disabled={history.index === 0}
          onClick={() => go(-1)}
        />
        <ToolButton
          icon="nav-forward"
          label="Forward"
          disabled={history.index >= history.stack.length - 1}
          onClick={() => go(1)}
        />
        <ToolButton icon="restart" label="Refresh" onClick={() => setReloadKey((k) => k + 1)} />
        <ToolButton icon="logo" label="Home" onClick={() => navigate(HOME_URL)} />
        <span className={styles.separator} aria-hidden />
        {demo && demo.liveUrl && demo.videoUrl && (
          <div className={styles.modeSwitch} role="group" aria-label="Demo view switcher">
            <button
              type="button"
              className={clsx(styles.modeBtn, !isVideo && styles.modeBtnActive)}
              onClick={() => navigate(demo.liveUrl!)}
              title={`View live production site (${hostOf(demo.liveUrl!)})`}
            >
              <Icon name="browser" size={16} />
              <span>Live Site</span>
            </button>
            <button
              type="button"
              className={clsx(styles.modeBtn, isVideo && styles.modeBtnActive)}
              onClick={() => navigate(demo.videoUrl!)}
              title="Watch demo video tour"
            >
              <Icon name="views" size={16} />
              <span>Demo Video</span>
            </button>
          </div>
        )}
        {url !== HOME_URL && (
          <a className={styles.newTab} href={url} target="_blank" rel="noopener noreferrer">
            Open in new tab
          </a>
        )}
      </div>

      <AddressBar key={url} url={url} onGo={navigate} />

      <div className={styles.viewport}>
        {url === HOME_URL ? (
          <HomePage onOpen={navigate} />
        ) : !isAllowed(url) ? (
          <Notice
            icon="warning"
            title="This page isn't on the guest list"
            text="Web Voyager only opens the live demos from this portfolio. You can still visit the site in a regular tab."
            url={url}
          />
        ) : (
          <EmbeddedPage key={`${url}#${reloadKey}`} url={url} onNavigate={navigate} />
        )}
      </div>
    </div>
  );
}

function ToolButton(props: {
  icon: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.tool}
      disabled={props.disabled}
      onClick={props.onClick}
      aria-label={props.label}
      title={props.label}
    >
      <Icon name={props.icon} size={24} />
    </button>
  );
}

function AddressBar({ url, onGo }: { url: string; onGo: (url: string) => void }) {
  const [draft, setDraft] = useState(url === HOME_URL ? "" : url);
  return (
    <form
      className={styles.address}
      onSubmit={(e) => {
        e.preventDefault();
        onGo(draft);
      }}
    >
      <label htmlFor={`address-${url}`} className={styles.addressLabel}>
        Address
      </label>
      <input
        id={`address-${url}`}
        className={styles.addressInput}
        value={draft}
        placeholder="Pick a demo below, or type a project URL"
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        inputMode="url"
      />
      <button type="submit" className={styles.go}>
        Go
      </button>
    </form>
  );
}

function HomePage({ onOpen }: { onOpen: (url: string) => void }) {
  return (
    <div className={styles.home}>
      <h2 className={styles.homeTitle}>Favorites</h2>
      <p className={styles.homeIntro}>
        Live demos of things I&apos;ve built. Pick one to take it for a spin.
      </p>
      <ul className={styles.cards}>
        {DEMOS.map((demo) => {
          const hasBoth = Boolean(demo.liveUrl && demo.videoUrl);
          return (
            <li key={demo.slug}>
              <div className={styles.card}>
                <button
                  type="button"
                  className={styles.cardCover}
                  onClick={() => onOpen(demo.url)}
                  aria-label={`Open ${demo.title}`}
                >
                  <span className={styles.cardImage}>
                    <Image src={demo.cover} alt="" fill sizes="(max-width: 767px) 100vw, 280px" />
                  </span>
                  <span className={styles.cardTitle}>{demo.title}</span>
                  <span className={styles.cardText}>{demo.description}</span>
                </button>
                <div className={styles.cardActions}>
                  {hasBoth ? (
                    <>
                      <button
                        type="button"
                        className={styles.choiceBtn}
                        onClick={() => onOpen(demo.liveUrl!)}
                        title={`Open live site (${hostOf(demo.liveUrl!)})`}
                      >
                        <Icon name="browser" size={16} />
                        <span>Live Site</span>
                      </button>
                      <button
                        type="button"
                        className={styles.choiceBtn}
                        onClick={() => onOpen(demo.videoUrl!)}
                        title="Watch demo video tour"
                      >
                        <Icon name="views" size={16} />
                        <span>Demo Video</span>
                      </button>
                    </>
                  ) : demo.videoUrl ? (
                    <button
                      type="button"
                      className={styles.choiceBtn}
                      onClick={() => onOpen(demo.videoUrl!)}
                      title="Watch demo video tour"
                    >
                      <Icon name="views" size={16} />
                      <span>Demo Video</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.choiceBtn}
                      onClick={() => onOpen(demo.liveUrl!)}
                      title={`Open live site (${hostOf(demo.liveUrl!)})`}
                    >
                      <Icon name="browser" size={16} />
                      <span className={styles.cardHost}>{hostOf(demo.liveUrl!)}</span>
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type EmbedState = "checking" | "embeddable" | "blocked";

function EmbeddedPage({ url, onNavigate }: { url: string; onNavigate: (url: string) => void }) {
  const [state, setState] = useState<EmbedState>("checking");
  const [loaded, setLoaded] = useState(false);
  const demo = demoFor(url);
  const isVideo = isVideoUrl(url);

  useEffect(() => {
    if (isVideo) {
      setState("embeddable");
      return;
    }
    let cancelled = false;
    fetch(`/api/embed-check?url=${encodeURIComponent(url)}`)
      .then((r) => r.json() as Promise<{ embeddable?: boolean }>)
      .then((r) => !cancelled && setState(r.embeddable ? "embeddable" : "blocked"))
      .catch(() => !cancelled && setState("blocked"));
    return () => {
      cancelled = true;
    };
  }, [url, isVideo]);

  if (state === "blocked") {
    return (
      <Notice
        icon="info"
        title={demo ? `${demo.title} prefers its own tab` : "This site prefers its own tab"}
        text="The site doesn't allow being shown inside other pages, so here's a preview instead."
        url={url}
        image={demo?.cover}
        videoUrl={demo?.videoUrl}
        onWatchVideo={demo?.videoUrl ? () => onNavigate(demo.videoUrl!) : undefined}
      />
    );
  }

  return (
    <>
      {(state === "checking" || !loaded) && (
        <div className={styles.loading} role="status">
          <div className={styles.progress} aria-hidden>
            <span />
          </div>
          Opening {hostOf(url)}…
        </div>
      )}
      {state === "embeddable" &&
        (isVideo ? (
          <video
            className={styles.frame}
            src={url}
            controls
            autoPlay
            playsInline
            onLoadedData={() => setLoaded(true)}
            title={demo?.title ?? hostOf(url)}
            style={{ objectFit: "contain", backgroundColor: "#000" }}
          />
        ) : (
          <iframe
            className={styles.frame}
            src={toEmbedUrl(url)}
            title={demo?.title ?? hostOf(url)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="fullscreen"
            onLoad={() => setLoaded(true)}
          />
        ))}
    </>
  );
}

function Notice(props: {
  icon: string;
  title: string;
  text: string;
  url: string;
  image?: string;
  videoUrl?: string | null;
  onWatchVideo?: () => void;
}) {
  return (
    <div className={styles.notice}>
      {props.image && (
        <span className={styles.noticeImage}>
          <Image src={props.image} alt="" fill sizes="(max-width: 767px) 100vw, 560px" />
        </span>
      )}
      <div className={styles.noticeBody}>
        <Icon name={props.icon} size={32} />
        <div>
          <h2 className={styles.noticeTitle}>{props.title}</h2>
          <p>{props.text}</p>
          <div className={styles.noticeActions}>
            <a
              className={styles.noticeLink}
              href={props.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open {hostOf(props.url)} in a new tab
            </a>
            {props.videoUrl && props.onWatchVideo && (
              <button
                type="button"
                className={styles.noticeVideoBtn}
                onClick={props.onWatchVideo}
              >
                <Icon name="views" size={16} />
                <span>Watch Demo Video instead</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
