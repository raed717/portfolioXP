import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { projects } from "@/data";
import { PATHS } from "@/data/fs";
import { useWindows } from "@/store/windows";
import ExplorerApp from "./index";

let windowId: string;

beforeEach(() => {
  useWindows.setState({ windows: [], nextZ: 10, lastPosition: {}, lastSize: {} });
  windowId = useWindows.getState().open("explorer", { params: { path: PATHS.documents } });
});

const win = () => useWindows.getState().windows.find((w) => w.id === windowId)!;

describe("Explorer", () => {
  it("lists folder contents and opens subfolders in place, updating the window title", () => {
    render(<ExplorerApp windowId={windowId} params={{ path: PATHS.documents }} />);
    fireEvent.doubleClick(screen.getByRole("option", { name: /projects/i }));

    expect(screen.getAllByRole("option")).toHaveLength(projects.length);
    expect(win().title).toBe("Projects");
    expect(win().params).toEqual({ path: PATHS.projects });
  });

  it("supports back, forward and up", () => {
    render(<ExplorerApp windowId={windowId} params={{ path: PATHS.documents }} />);
    fireEvent.doubleClick(screen.getByRole("option", { name: /projects/i }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(win().title).toBe("My Documents");
    fireEvent.click(screen.getByRole("button", { name: "Forward" }));
    expect(win().title).toBe("Projects");
    fireEvent.click(screen.getByRole("button", { name: /up one level/i }));
    expect(win().title).toBe("My Documents");
  });

  it("navigates from the address bar using C:\\ paths", () => {
    render(<ExplorerApp windowId={windowId} params={{ path: PATHS.documents }} />);
    const input = screen.getByLabelText("Address");
    fireEvent.change(input, { target: { value: "C:\\My Documents\\Experience" } });
    fireEvent.submit(input);
    expect(win().title).toBe("Experience");
  });

  it("opens files in their program instead of navigating", () => {
    render(<ExplorerApp windowId={windowId} params={{ path: "/" }} />);
    fireEvent.doubleClick(screen.getByRole("option", { name: "about_me.txt" }));
    expect(useWindows.getState().windows.at(-1)?.appId).toBe("notepad");
  });

  it("shows a friendly message in the empty Recycle Bin", () => {
    render(<ExplorerApp windowId={windowId} params={{ path: PATHS.recycleBin }} />);
    expect(screen.getByText(/recycle bin is empty/i)).toBeInTheDocument();
  });
});
