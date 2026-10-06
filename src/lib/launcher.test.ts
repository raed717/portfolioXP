import { beforeEach, describe, expect, it } from "vitest";
import { PATHS } from "@/data/fs";
import { useSession } from "@/store/session";
import { useWindows } from "@/store/windows";
import { openPath } from "./launcher";

const windows = () => useWindows.getState().windows;

beforeEach(() => {
  useWindows.setState({ windows: [], nextZ: 10, lastPosition: {}, lastSize: {} });
  useSession.setState({ phase: "desktop" });
});

describe("openPath", () => {
  it("opens folders in Explorer with the canonical path", () => {
    openPath("/my documents/projects");
    expect(windows()[0]).toMatchObject({
      appId: "explorer",
      title: "Projects",
      params: { path: PATHS.projects },
    });
  });

  it("opens text files in Notepad", () => {
    openPath(PATHS.aboutMe);
    expect(windows()[0]).toMatchObject({ appId: "notepad", icon: "txt" });
  });

  it("opens the resume in the PDF viewer", () => {
    openPath(PATHS.resume);
    expect(windows()[0].appId).toBe("pdf-viewer");
  });

  it("triggers the blue screen for do_not_open.exe without opening a window", () => {
    openPath("/do_not_open.exe");
    expect(useSession.getState().phase).toBe("bsod");
    expect(windows()).toHaveLength(0);
  });

  it("shows a friendly error for missing paths", () => {
    openPath("/nope.txt");
    expect(windows()[0]).toMatchObject({ appId: "message", title: "File not found" });
  });
});
