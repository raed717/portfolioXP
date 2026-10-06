/**
 * The one place that decides what "open" means (§6, §11.3).
 * Desktop icons, the Start menu, Explorer and the Terminal all go through these helpers.
 */
import { APPS, OPENS_WITH } from "@/apps/registry";
import type { AppId } from "@/apps/types";
import { fsRoot } from "@/data/fs";
import { iconFor } from "@/lib/fileInfo";
import { prefersMaximized } from "@/lib/layout";
import { canonicalPath, getNode, resolvePath } from "@/lib/vfs";
import { useSession } from "@/store/session";
import { useWindows, type OpenOptions } from "@/store/windows";

export type MessageIcon = "info" | "warning" | "error" | "question";

export function openApp(appId: AppId, options: OpenOptions = {}): string {
  const maximized = APPS[appId].kind !== "dialog" && prefersMaximized();
  return useWindows.getState().open(appId, { maximized, ...options });
}

export function showMessage(title: string, message: string, icon: MessageIcon = "info"): string {
  return useWindows.getState().open("message", { title, icon, params: { message, icon } });
}

/** Opens a VFS path in its default program. `extraParams` are merged into the window params. */
export function openPath(path: string, extraParams?: Record<string, unknown>): string | null {
  const node = getNode(fsRoot, path);
  const canonical = canonicalPath(fsRoot, path);
  if (!node || canonical === null) {
    showMessage(
      "File not found",
      `I can't find "${path}". Check the spelling and try again.`,
      "error",
    );
    return null;
  }

  if (node.type === "folder") {
    return openApp("explorer", {
      title: node.name || "Desktop",
      icon: node.icon ?? "folder-open",
      params: { path: canonical, ...extraParams },
    });
  }

  if (node.meta?.easterEgg === "bsod") {
    useSession.getState().setPhase("bsod");
    return null;
  }

  const appId = OPENS_WITH[node.ext];
  // A project's demo.exe is better titled by its project folder than "demo.exe".
  const label = node.ext === "exe" ? getNode(fsRoot, resolvePath(canonical, ".."))?.name : null;
  return openApp(appId, {
    title: `${label || node.name} - ${APPS[appId].title}`,
    icon: iconFor(node),
    params: { path: canonical, ...extraParams },
  });
}

/** What a Properties dialog describes (§5.4, §6.1). */
export type PropertiesTarget =
  | { kind: "path"; path: string }
  | { kind: "shortcut"; name: string; icon: string; description: string };

export function openProperties(target: PropertiesTarget): string {
  const name =
    target.kind === "shortcut" ? target.name : getNode(fsRoot, target.path)?.name || "Desktop";
  return openApp("properties", {
    title: `${name} Properties`,
    icon: "properties",
    params: { ...target },
  });
}
