"use client";

import type { AppProps } from "@/apps/types";
import { Icon } from "@/components/ui/Icon";
import { CV_PDF_PATH } from "@/data";
import { fsRoot } from "@/data/fs";
import { getNode } from "@/lib/vfs";
import styles from "./pdf-viewer.module.css";

/** Embedded résumé with download (§6). Params: { path: string } pointing at a .pdf file. */
export default function PdfViewerApp({ params }: AppProps) {
  const node = getNode(fsRoot, typeof params?.path === "string" ? params.path : "");
  const src = node?.type === "file" && node.src ? node.src : CV_PDF_PATH;
  const name = node?.name ?? "Resume.pdf";

  return (
    <div className={styles.viewer}>
      <div className={styles.toolbar}>
        <a className={styles.action} href={src} download>
          <Icon name="pdf" size={16} />
          Download
        </a>
        <a className={styles.action} href={src} target="_blank" rel="noopener noreferrer">
          <Icon name="browser" size={16} />
          Open in new tab
        </a>
        <span className={styles.name}>{name}</span>
      </div>
      <object className={styles.document} data={src} type="application/pdf" aria-label={name}>
        <div className={styles.fallback}>
          <Icon name="pdf" size={48} />
          <p>This browser can&apos;t show PDFs inside a window.</p>
          <a className={styles.action} href={src} download>
            Download {name}
          </a>
        </div>
      </object>
    </div>
  );
}
