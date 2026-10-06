import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useContextMenu } from "@/store/contextMenu";
import { ContextMenu } from "./ContextMenu";

beforeEach(() => useContextMenu.setState({ menu: null }));

describe("ContextMenu", () => {
  it("runs the chosen action and closes", () => {
    const onOpen = vi.fn();
    render(<ContextMenu />);
    act(() =>
      useContextMenu
        .getState()
        .open(10, 10, [
          { label: "Open", isDefault: true, onSelect: onOpen },
          "separator",
          { label: "Properties", onSelect: vi.fn() },
        ]),
    );
    expect(screen.getByRole("menuitem", { name: "Open" })).toHaveFocus();
    fireEvent.click(screen.getByRole("menuitem", { name: "Open" }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("supports arrow keys and Escape", () => {
    render(<ContextMenu />);
    act(() =>
      useContextMenu.getState().open(10, 10, [
        { label: "One", onSelect: vi.fn() },
        { label: "Disabled", disabled: true, onSelect: vi.fn() },
        { label: "Two", onSelect: vi.fn() },
      ]),
    );
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Two" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
