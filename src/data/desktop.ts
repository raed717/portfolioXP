/** Desktop shortcuts (§4.3, §6). Order is the grid order: top-to-bottom, then left-to-right. */
import type { AppId } from "@/apps/types";
import { PATHS, fsRoot } from "./fs";
import { listDir } from "@/lib/vfs";

export type ShortcutTarget =
  { type: "path"; path: string } | { type: "app"; appId: AppId } | { type: "link"; href: string };

export type DesktopShortcut = {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
  target: ShortcutTarget;
};

const recycleBinFull = (listDir(fsRoot, PATHS.recycleBin)?.length ?? 0) > 0;

export const DESKTOP_SHORTCUTS: DesktopShortcut[] = [
  {
    id: "quick-view",
    label: "Quick View CV",
    icon: "properties",
    tooltip: "The whole CV on one plain page (fast path)",
    target: { type: "link", href: "/cv" },
  },
  {
    id: "documents",
    label: "My Documents",
    icon: "folder-documents",
    tooltip: "Projects, experience, education and more",
    target: { type: "path", path: PATHS.documents },
  },
  {
    id: "computer",
    label: "My Computer",
    icon: "computer",
    tooltip: "Skills, presented as drives",
    target: { type: "app", appId: "sysinfo" },
  },
  {
    id: "projects",
    label: "My Projects",
    icon: "folder",
    tooltip: "Everything I've built, one folder per project",
    target: { type: "path", path: PATHS.projects },
  },
  {
    id: "about",
    label: "about_me.txt",
    icon: "txt",
    tooltip: "Who I am, in plain text",
    target: { type: "path", path: PATHS.aboutMe },
  },
  {
    id: "resume",
    label: "Resume.pdf",
    icon: "pdf",
    tooltip: "My CV, viewable and downloadable",
    target: { type: "path", path: PATHS.resume },
  },
  {
    id: "terminal",
    label: "Command Prompt",
    icon: "terminal",
    tooltip: "Explore the portfolio from a command line",
    target: { type: "app", appId: "terminal" },
  },
  {
    id: "browser",
    label: "Web Voyager",
    icon: "browser",
    tooltip: "Browse live project demos",
    target: { type: "app", appId: "browser" },
  },
  {
    id: "mail",
    label: "Contact Me",
    icon: "mail",
    tooltip: "Send me a message",
    target: { type: "app", appId: "mail" },
  },
  {
    id: "recycle",
    label: "Recycle Bin",
    icon: recycleBinFull ? "recycle-full" : "recycle-empty",
    tooltip: "Abandoned ideas and lessons learned",
    target: { type: "path", path: PATHS.recycleBin },
  },
  {
    id: "forbidden",
    label: "do_not_open.exe",
    icon: "exe",
    tooltip: "Seriously. Don't.",
    target: { type: "path", path: "/do_not_open.exe" },
  },
];
