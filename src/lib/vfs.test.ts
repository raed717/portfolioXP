import { describe, expect, it } from "vitest";
import { canonicalPath, getNode, listDir, resolvePath } from "./vfs";
import { PATHS, fsRoot } from "@/data/fs";
import { projects } from "@/data";

describe("resolvePath", () => {
  it("handles relative, absolute, . and ..", () => {
    expect(resolvePath("/My Documents", "Projects")).toBe("/My Documents/Projects");
    expect(resolvePath("/My Documents/Projects", "..")).toBe("/My Documents");
    expect(resolvePath("/a/b", "/c/./d")).toBe("/c/d");
    expect(resolvePath("/", "../..")).toBe("/");
  });
});

describe("portfolio file system", () => {
  it("has one folder per project, each with a README", () => {
    const dirs = listDir(fsRoot, PATHS.projects);
    expect(dirs).toHaveLength(projects.length);
    for (const p of projects) {
      const readme = getNode(fsRoot, `${PATHS.projects}/${p.title}/README.txt`);
      expect(readme?.type).toBe("file");
      expect(readme && "content" in readme && readme.content).toContain(p.title);
    }
  });

  it("looks up paths case-insensitively and returns the canonical casing", () => {
    expect(canonicalPath(fsRoot, "/my documents/PROJECTS")).toBe(PATHS.projects);
    expect(getNode(fsRoot, "/nope")).toBeNull();
  });

  it("does not create demo.exe for projects with no usable link", () => {
    for (const p of projects) {
      const demo = getNode(fsRoot, `${PATHS.projects}/${p.title}/demo.exe`);
      expect(Boolean(demo)).toBe(Boolean(p.liveUrl || p.githubUrl));
    }
  });
});
