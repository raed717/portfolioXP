"use client";

import type { ReactNode } from "react";
import { APPS, OPENS_WITH } from "@/apps/registry";
import type { AppProps } from "@/apps/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tabs, type Tab } from "@/components/ui/Tabs";
import { getProject } from "@/data";
import { fsRoot } from "@/data/fs";
import { iconFor, sizeLabel, toDisplayPath, typeLabel } from "@/lib/fileInfo";
import { getNode, resolvePath } from "@/lib/vfs";
import { useWindows } from "@/store/windows";
import type { Project } from "@/types/content";
import styles from "./properties.module.css";

/**
 * Properties dialog (§5.4, §6.1). Params are a PropertiesTarget from lib/launcher:
 * { kind: "path", path } or { kind: "shortcut", name, icon, description }.
 * Project folders get General / Tech Stack / Features / Links tabs.
 */
export default function PropertiesApp({ windowId, params }: AppProps) {
  const close = useWindows((s) => s.close);
  const tabs = buildTabs(params ?? {});

  return (
    <div className={styles.sheet}>
      <Tabs tabs={tabs} label="Properties" />
      <div className={styles.actions}>
        <Button onClick={() => close(windowId)}>OK</Button>
      </div>
    </div>
  );
}

function buildTabs(params: Record<string, unknown>): Tab[] {
  if (params.kind === "shortcut") {
    const name = String(params.name ?? "");
    return [
      {
        id: "general",
        label: "General",
        content: (
          <General icon={String(params.icon ?? "exe")} name={name}>
            <Row label="Type">Shortcut</Row>
            <Row label="Description">{String(params.description ?? "")}</Row>
          </General>
        ),
      },
    ];
  }

  const path = typeof params.path === "string" ? params.path : "/";
  const node = getNode(fsRoot, path);
  if (!node) {
    return [{ id: "general", label: "General", content: <p>This item no longer exists.</p> }];
  }

  const slug = node.type === "folder" ? node.meta?.projectSlug : undefined;
  const project = typeof slug === "string" ? getProject(slug) : undefined;
  if (project) return projectTabs(project, path);

  const location = toDisplayPath(resolvePath(path, ".."));
  return [
    {
      id: "general",
      label: "General",
      content: (
        <General icon={iconFor(node)} name={node.name || "Desktop"}>
          <Row label="Type">{typeLabel(node)}</Row>
          {node.type === "file" && <Row label="Opens with">{APPS[OPENS_WITH[node.ext]].title}</Row>}
          <Row label="Location">{location}</Row>
          {sizeLabel(node) && <Row label="Size">{sizeLabel(node)}</Row>}
          {node.type === "folder" && <Row label="Contains">{describeContents(node.children)}</Row>}
        </General>
      ),
    },
  ];
}

function projectTabs(project: Project, path: string): Tab[] {
  const tabs: Tab[] = [
    {
      id: "general",
      label: "General",
      content: (
        <General icon="folder" name={project.title}>
          <Row label="Type">Project Folder</Row>
          <Row label="Location">{toDisplayPath(resolvePath(path, ".."))}</Row>
          {project.role && <Row label="Role">{project.role}</Row>}
          {project.period && <Row label="Period">{project.period}</Row>}
          <Row label="Summary">{project.description}</Row>
          {project.results && <Row label="Results">{project.results}</Row>}
          {project.longDescription && <p className={styles.long}>{project.longDescription}</p>}
        </General>
      ),
    },
    {
      id: "stack",
      label: "Tech Stack",
      content: (
        <ul className={styles.chips}>
          {project.technologies.map((t) => (
            <li key={t} className={styles.chip}>
              {t}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  if (project.features.length > 0) {
    tabs.push({
      id: "features",
      label: "Features",
      content: (
        <ul className={styles.list}>
          {project.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ),
    });
  }

  tabs.push({
    id: "links",
    label: "Links",
    content: (
      <dl className={styles.rows}>
        <Row label="Source code">
          {project.githubUrl ? <ExternalLink href={project.githubUrl} /> : "No public repository"}
        </Row>
        <Row label="Live demo">
          {project.liveUrl ? <ExternalLink href={project.liveUrl} /> : "No public demo"}
        </Row>
        {project.videoUrl && (
          <Row label="Demo video">
            <ExternalLink href={project.videoUrl} />
          </Row>
        )}
      </dl>
    ),
  });

  return tabs;
}

function describeContents(children: { type: string }[]): string {
  const folders = children.filter((c) => c.type === "folder").length;
  const files = children.length - folders;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return `${plural(files, "file")}, ${plural(folders, "folder")}`;
}

function General({ icon, name, children }: { icon: string; name: string; children: ReactNode }) {
  return (
    <div>
      <div className={styles.identity}>
        <Icon name={icon} size={32} />
        <span className={styles.name}>{name}</span>
      </div>
      <hr className={styles.separator} />
      <dl className={styles.rows}>{children}</dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <dt>{label}:</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ExternalLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
      {href.replace(/^https?:\/\//, "")}
    </a>
  );
}
