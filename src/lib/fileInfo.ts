/** Display metadata for VFS nodes: icon, type label, size. Shared by Explorer, Properties and the Terminal. */
import type { VNode } from "@/lib/vfs";

const EXT_ICON: Record<string, string> = { png: "image", jpg: "image", md: "txt" };

const TYPE_LABEL: Record<string, string> = {
  txt: "Text Document",
  md: "Text Document",
  ini: "Configuration Settings",
  pdf: "PDF Document",
  exe: "Application",
  png: "PNG Image",
  jpg: "JPEG Image",
};

/** Icon basename in /public/icons for a VFS node. */
export function iconFor(node: VNode): string {
  if (node.icon) return node.icon;
  if (node.type === "folder") return "folder";
  return EXT_ICON[node.ext] ?? node.ext;
}

export function typeLabel(node: VNode): string {
  return node.type === "folder" ? "File Folder" : (TYPE_LABEL[node.ext] ?? "File");
}

/** Size for text files (bytes of content); other files have no meaningful local size. */
export function sizeLabel(node: VNode): string {
  if (node.type === "folder" || typeof node.content !== "string") return "";
  const bytes = new TextEncoder().encode(node.content).length;
  return bytes < 1024 ? `${bytes} bytes` : `${Math.ceil(bytes / 1024)} KB`;
}

/** "C:\My Documents\Projects" — the address-bar spelling of a VFS path. */
export function toDisplayPath(path: string): string {
  return "C:\\" + path.split("/").filter(Boolean).join("\\");
}

/** Accepts "C:\a\b", "c:/a/b", "/a/b" or "a\b" and returns a VFS path. */
export function fromDisplayPath(input: string): string {
  const normalized = input
    .trim()
    .replace(/^[a-z]:/i, "")
    .replace(/\\/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
