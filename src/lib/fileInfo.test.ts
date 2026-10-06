import { describe, expect, it } from "vitest";
import { fromDisplayPath, iconFor, toDisplayPath, typeLabel } from "./fileInfo";

describe("fileInfo", () => {
  it("round-trips VFS paths through the C:\\ address-bar format", () => {
    expect(toDisplayPath("/My Documents/Projects")).toBe("C:\\My Documents\\Projects");
    expect(toDisplayPath("/")).toBe("C:\\");
    expect(fromDisplayPath("C:\\My Documents\\Projects")).toBe("/My Documents/Projects");
    expect(fromDisplayPath("c:/My Documents")).toBe("/My Documents");
    expect(fromDisplayPath("My Documents")).toBe("/My Documents");
  });

  it("maps file types to icons and labels", () => {
    const png = { type: "file", name: "a.png", ext: "png" } as const;
    expect(iconFor(png)).toBe("image");
    expect(typeLabel(png)).toBe("PNG Image");
    expect(typeLabel({ type: "folder", name: "x", children: [] })).toBe("File Folder");
  });
});
