/**
 * App registry (THEME_CONTEXT.md §11.4). Adding a program = one entry here + one component folder.
 * Keep this file free of component imports: loaders are only invoked when a window mounts.
 */
import type { AppDefinition, AppId } from "./types";
import type { FileExt } from "@/lib/vfs";

export const APPS: Record<AppId, AppDefinition> = {
  explorer: {
    id: "explorer",
    title: "Explorer",
    icon: "folder-open",
    defaultSize: { width: 640, height: 440 },
    minSize: { width: 320, height: 220 },
    resizable: true,
    singleInstance: false,
    load: () => import("./explorer"),
  },
  notepad: {
    id: "notepad",
    title: "Notepad",
    icon: "txt",
    defaultSize: { width: 560, height: 420 },
    minSize: { width: 280, height: 180 },
    resizable: true,
    singleInstance: false,
    load: () => import("./notepad"),
  },
  terminal: {
    id: "terminal",
    title: "Command Prompt",
    icon: "terminal",
    defaultSize: { width: 640, height: 400 },
    minSize: { width: 360, height: 200 },
    resizable: true,
    singleInstance: false,
    load: () => import("./terminal"),
  },
  browser: {
    id: "browser",
    title: "Web Voyager",
    icon: "browser",
    defaultSize: { width: 900, height: 600 },
    minSize: { width: 400, height: 300 },
    resizable: true,
    singleInstance: false,
    embedsFrame: true,
    load: () => import("./browser"),
  },
  mail: {
    id: "mail",
    title: "New Message",
    icon: "mail",
    defaultSize: { width: 520, height: 460 },
    minSize: { width: 340, height: 320 },
    resizable: true,
    singleInstance: true,
    load: () => import("./mail"),
  },
  "pdf-viewer": {
    id: "pdf-viewer",
    title: "Resume Viewer",
    icon: "pdf",
    defaultSize: { width: 720, height: 640 },
    minSize: { width: 360, height: 300 },
    resizable: true,
    singleInstance: true,
    embedsFrame: true,
    load: () => import("./pdf-viewer"),
  },
  "image-viewer": {
    id: "image-viewer",
    title: "Picture Viewer",
    icon: "image",
    defaultSize: { width: 720, height: 520 },
    minSize: { width: 300, height: 240 },
    resizable: true,
    singleInstance: false,
    load: () => import("./image-viewer"),
  },
  sysinfo: {
    id: "sysinfo",
    title: "My Computer",
    icon: "computer",
    defaultSize: { width: 620, height: 460 },
    minSize: { width: 340, height: 280 },
    resizable: true,
    singleInstance: true,
    load: () => import("./sysinfo"),
  },
  controlpanel: {
    id: "controlpanel",
    title: "Control Panel",
    icon: "control-panel",
    defaultSize: { width: 540, height: 470 },
    resizable: false,
    singleInstance: true,
    load: () => import("./controlpanel"),
  },
  properties: {
    id: "properties",
    title: "Properties",
    icon: "properties",
    defaultSize: { width: 400, height: 440 },
    resizable: false,
    singleInstance: false,
    kind: "dialog",
    load: () => import("./properties"),
  },
  message: {
    id: "message",
    title: "Message",
    icon: "info",
    defaultSize: { width: 380, height: 180 },
    resizable: false,
    singleInstance: false,
    kind: "dialog",
    load: () => import("./message"),
  },
  minesweeper: {
    id: "minesweeper",
    title: "Minesweeper",
    icon: "mine",
    defaultSize: { width: 280, height: 360 },
    resizable: false,
    singleInstance: true,
  },
};

/** Default program per file extension (§11.3). */
export const OPENS_WITH: Record<FileExt, AppId> = {
  txt: "notepad",
  ini: "notepad",
  md: "notepad",
  pdf: "pdf-viewer",
  png: "image-viewer",
  jpg: "image-viewer",
  exe: "browser",
};

export function getApp(id: AppId): AppDefinition {
  return APPS[id];
}
