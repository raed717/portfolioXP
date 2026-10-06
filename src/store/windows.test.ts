import { beforeEach, describe, expect, it } from "vitest";
import { CASCADE_OFFSET, useWindows } from "./windows";

const store = () => useWindows.getState();

beforeEach(() => {
  useWindows.setState({ windows: [], nextZ: 10, lastPosition: {}, lastSize: {} });
});

describe("window manager", () => {
  it("opens a focused window on top and cascades the next one", () => {
    const a = store().open("notepad");
    const b = store().open("explorer");
    const [wa, wb] = store().windows;
    expect(wa.id).toBe(a);
    expect(wb.id).toBe(b);
    expect(wb.zIndex).toBeGreaterThan(wa.zIndex);
    expect(wa.isFocused).toBe(false);
    expect(wb.isFocused).toBe(true);
    expect(wb.x - wa.x).toBe(CASCADE_OFFSET);
  });

  it("focuses the existing instance of a single-instance app", () => {
    const first = store().open("controlpanel");
    store().open("notepad");
    const second = store().open("controlpanel");
    expect(second).toBe(first);
    expect(store().windows.filter((w) => w.appId === "controlpanel")).toHaveLength(1);
    expect(store().windows.find((w) => w.id === first)?.isFocused).toBe(true);
  });

  it("taskbar toggle minimizes the focused window and restores it", () => {
    const id = store().open("notepad");
    store().toggleFromTaskbar(id);
    expect(store().windows[0].isMinimized).toBe(true);
    expect(store().windows[0].isFocused).toBe(false);
    store().toggleFromTaskbar(id);
    expect(store().windows[0].isMinimized).toBe(false);
    expect(store().windows[0].isFocused).toBe(true);
  });

  it("closing the focused window focuses the next top-most visible one", () => {
    const a = store().open("notepad");
    const b = store().open("explorer");
    store().close(b);
    expect(store().windows.map((w) => w.id)).toEqual([a]);
    expect(store().windows[0].isFocused).toBe(true);
  });

  it("never maximizes dialog windows", () => {
    const id = store().open("properties");
    store().toggleMaximize(id);
    expect(store().windows[0].isMaximized).toBe(false);
  });

  it("clamps resize to the minimum size", () => {
    const id = store().open("notepad");
    store().resize(id, { width: 10, height: 10 });
    const w = store().windows[0];
    expect(w.width).toBe(w.minWidth);
    expect(w.height).toBe(w.minHeight);
  });

  it("remembers the last position per app", () => {
    const id = store().open("terminal");
    store().move(id, { x: 300, y: 200 });
    store().close(id);
    store().open("terminal");
    expect(store().windows[0]).toMatchObject({ x: 300, y: 200 });
  });
});
