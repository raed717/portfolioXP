/** Virtual file system primitives (THEME_CONTEXT.md §11.3). Pure functions, no React. */

export type FileExt = "txt" | "pdf" | "exe" | "png" | "jpg" | "ini" | "md";

export type FolderNode = {
  type: "folder";
  name: string;
  icon?: string;
  children: VNode[];
  /** Extra data, e.g. { projectSlug } on project folders. */
  meta?: Record<string, unknown>;
};

export type FileNode = {
  type: "file";
  name: string;
  ext: FileExt;
  icon?: string;
  /** Inline text content (txt / ini / md). */
  content?: string;
  /** URL for binary-ish files (pdf / images). */
  src?: string;
  /** Extra data for the opening app (e.g. { url } for demo.exe, { easterEgg: "bsod" }). */
  meta?: Record<string, unknown>;
};

export type VNode = FolderNode | FileNode;

export function extOf(name: string): FileExt | null {
  const ext = name.split(".").pop()?.toLowerCase();
  const known: FileExt[] = ["txt", "pdf", "exe", "png", "jpg", "ini", "md"];
  return ext && known.includes(ext as FileExt) ? (ext as FileExt) : null;
}

export function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

/** Resolve `target` against `cwd` (handles absolute paths, "." and ".."). Returns a normalized absolute path. */
export function resolvePath(cwd: string, target: string): string {
  const parts = target.startsWith("/") ? [] : splitPath(cwd);
  for (const segment of splitPath(target)) {
    if (segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return "/" + parts.join("/");
}

/** Case-insensitive lookup, like the old desktop file systems. */
export function getNode(root: FolderNode, path: string): VNode | null {
  let node: VNode = root;
  for (const segment of splitPath(path)) {
    if (node.type !== "folder") return null;
    const next: VNode | undefined = node.children.find(
      (child) => child.name.toLowerCase() === segment.toLowerCase(),
    );
    if (!next) return null;
    node = next;
  }
  return node;
}

/** Canonical (correctly-cased) absolute path for a path that exists, or null. */
export function canonicalPath(root: FolderNode, path: string): string | null {
  const names: string[] = [];
  let node: VNode = root;
  for (const segment of splitPath(path)) {
    if (node.type !== "folder") return null;
    const next: VNode | undefined = node.children.find(
      (child) => child.name.toLowerCase() === segment.toLowerCase(),
    );
    if (!next) return null;
    names.push(next.name);
    node = next;
  }
  return "/" + names.join("/");
}

export function listDir(root: FolderNode, path: string): VNode[] | null {
  const node = getNode(root, path);
  return node?.type === "folder" ? node.children : null;
}

export function folder(name: string, children: VNode[], icon?: string): FolderNode {
  return { type: "folder", name, children, icon };
}

export function textFile(name: string, content: string, meta?: Record<string, unknown>): FileNode {
  return { type: "file", name, ext: extOf(name) ?? "txt", content, meta };
}
