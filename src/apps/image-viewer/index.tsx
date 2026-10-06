"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import type { AppProps } from "@/apps/types";
import { Icon } from "@/components/ui/Icon";
import { fsRoot } from "@/data/fs";
import { getNode, resolvePath, type FileNode } from "@/lib/vfs";
import { useWindows } from "@/store/windows";
import styles from "./image-viewer.module.css";

const isImage = (n: { type: string; ext?: string }): n is FileNode =>
  n.type === "file" && (n.ext === "png" || n.ext === "jpg");

/** Screenshot viewer with previous/next through the folder (§6.1). Params: { path: string }. */
export default function ImageViewerApp({ windowId, params }: AppProps) {
  const update = useWindows((s) => s.update);
  const path = typeof params?.path === "string" ? params.path : "";
  const folderPath = resolvePath(path, "..");
  const parent = getNode(fsRoot, folderPath);
  const images = parent?.type === "folder" ? parent.children.filter(isImage) : [];
  const startName = getNode(fsRoot, path)?.name;
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      images.findIndex((img) => img.name === startName),
    ),
  );

  const image = images[index];
  if (!image?.src) {
    return <p className={styles.missing}>This picture is missing. It probably went on holiday.</p>;
  }

  // Project name for the caption: …/Projects/<Project>/screenshots/<file>
  const projectName = getNode(fsRoot, resolvePath(folderPath, ".."))?.name;

  function step(delta: number) {
    const next = (index + delta + images.length) % images.length;
    setIndex(next);
    update(windowId, {
      title: `${images[next].name} - Picture Viewer`,
      params: { path: resolvePath(folderPath, images[next].name) },
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  }

  const multiple = images.length > 1;

  return (
    <div
      className={styles.viewer}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Picture viewer. Use the left and right arrow keys to browse."
    >
      <div className={styles.stage}>
        <Image
          key={image.src}
          src={image.src}
          alt={`${projectName ?? "Project"} screenshot ${index + 1} of ${images.length}`}
          fill
          sizes="(max-width: 767px) 100vw, 900px"
          className={styles.image}
        />
      </div>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.nav}
          onClick={() => step(-1)}
          disabled={!multiple}
          aria-label="Previous picture"
        >
          <Icon name="nav-back" size={24} />
        </button>
        <span className={styles.caption}>
          {projectName ? `${projectName} — ` : ""}
          {index + 1} of {images.length}
        </span>
        <button
          type="button"
          className={styles.nav}
          onClick={() => step(1)}
          disabled={!multiple}
          aria-label="Next picture"
        >
          <Icon name="nav-forward" size={24} />
        </button>
        <a className={styles.original} href={image.src} target="_blank" rel="noopener noreferrer">
          Open original
        </a>
      </div>
    </div>
  );
}
