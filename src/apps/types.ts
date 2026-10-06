import type { ComponentType } from "react";

export type AppId =
  | "explorer"
  | "notepad"
  | "terminal"
  | "browser"
  | "mail"
  | "pdf-viewer"
  | "image-viewer"
  | "sysinfo"
  | "controlpanel"
  | "properties"
  | "message"
  | "minesweeper";

/** Props every program receives from its window. */
export type AppProps = {
  windowId: string;
  params?: Record<string, unknown>;
};

export type AppDefinition = {
  id: AppId;
  title: string;
  /** Icon basename in /public/icons (without extension). */
  icon: string;
  defaultSize: { width: number; height: number };
  minSize?: { width: number; height: number };
  resizable: boolean;
  singleInstance: boolean;
  /** Dialog-type windows close on Esc and are never maximized (§5.1). */
  kind?: "window" | "dialog";
  /** Content renders an iframe/object (PDF, web pages), which swallows clicks while inactive. */
  embedsFrame?: boolean;
  /**
   * Lazy loader for the program component (§11.5). Left undefined until the app's sprint ships;
   * the window then renders the friendly "not available yet" dialog (§7.4) instead of dead UI.
   */
  load?: () => Promise<{ default: ComponentType<AppProps> }>;
};
