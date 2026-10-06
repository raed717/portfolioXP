import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSession } from "@/store/session";
import { useWindows } from "@/store/windows";
import Experience from "./Experience";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeEach(() => {
  window.sessionStorage.clear();
  useSession.setState({ phase: "boot", persona: null, personaLaunched: false, replayIntro: false });
  useWindows.setState({ windows: [], nextZ: 10, lastPosition: {}, lastSize: {} });
});

describe("experience flow", () => {
  it("skips the boot screen on key press and remembers it for the session", () => {
    render(<Experience />);
    expect(screen.getByRole("status", { name: /starting up/i })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByRole("list", { name: /accounts/i })).toBeInTheDocument();
    expect(window.sessionStorage.getItem("portfolioxp:introSeen")).toBe("true");
  });

  it("goes straight to login when the intro was already seen", () => {
    window.sessionStorage.setItem("portfolioxp:introSeen", "true");
    render(<Experience />);
    expect(screen.getByRole("list", { name: /accounts/i })).toBeInTheDocument();
  });

  it("logs in as Recruiter and opens the resume and quick facts", async () => {
    useSession.setState({ phase: "login" });
    render(<Experience />);
    fireEvent.click(screen.getByRole("button", { name: /recruiter/i }));

    expect(screen.getByRole("navigation", { name: /taskbar/i })).toBeInTheDocument();
    const titles = useWindows.getState().windows.map((w) => w.title);
    expect(titles).toEqual(["Resume.pdf - Resume Viewer", "Quick Facts"]);
    await waitFor(() => expect(screen.getByText(/currently:/i)).toBeInTheDocument());
  });

  it("taskbar button minimizes the focused window", () => {
    useSession.setState({ phase: "desktop", persona: "guest", personaLaunched: true });
    render(<Experience />);
    act(() => {
      useWindows.getState().open("notepad", { title: "Notes", params: { path: "/about_me.txt" } });
    });
    fireEvent.click(screen.getByRole("button", { name: "Notes", pressed: true }));
    expect(useWindows.getState().windows[0].isMinimized).toBe(true);
  });

  it("opens and closes the Start menu with Escape", () => {
    useSession.setState({ phase: "desktop", persona: "guest", personaLaunched: true });
    render(<Experience />);
    const start = screen.getByRole("button", { name: "RG" });
    fireEvent.click(start);
    const menu = screen.getByRole("menu", { name: /start menu/i });
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(screen.queryByRole("menu", { name: /start menu/i })).not.toBeInTheDocument();
    expect(start).toHaveFocus();
  });
});
