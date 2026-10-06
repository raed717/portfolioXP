import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ControlPanelApp from "@/apps/controlpanel";
import { useIdle } from "@/hooks/useIdle";
import { DEFAULT_PREFERENCES, usePreferences } from "@/store/preferences";
import { useSession } from "@/store/session";
import { useWindows } from "@/store/windows";
import { SIDEKICK_DELAY_MS, Sidekick } from "./Sidekick";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeEach(() => {
  window.sessionStorage.clear();
  usePreferences.setState({ ...DEFAULT_PREFERENCES });
  useWindows.setState({ windows: [], nextZ: 10, lastPosition: {}, lastSize: {} });
  useSession.setState({ persona: "recruiter" });
});

afterEach(() => vi.useRealTimers());

describe("window layout persistence", () => {
  it("reopens an app at its last size and forgets it on reset", () => {
    const store = useWindows.getState;
    const id = store().open("notepad");
    store().resize(id, { width: 700, height: 500 });
    store().close(id);
    store().open("notepad");
    expect(store().windows[0]).toMatchObject({ width: 700, height: 500 });

    store().resetLayout();
    store().closeAll();
    store().open("notepad");
    expect(store().windows[0].width).not.toBe(700);
  });

  it("persists only the layout, never open windows", () => {
    useWindows.getState().open("notepad");
    const saved = JSON.parse(window.localStorage.getItem("portfolioxp:layout") ?? "{}");
    expect(Object.keys(saved.state)).toEqual(["lastPosition", "lastSize"]);
  });
});

describe("preferences migration", () => {
  it("maps the v1 'hills' wallpaper (the photo) to 'meadow'", async () => {
    window.localStorage.setItem(
      "portfolioxp:prefs",
      JSON.stringify({ state: { wallpaper: "hills", soundEnabled: true }, version: 1 }),
    );
    await usePreferences.persist.rehydrate();
    expect(usePreferences.getState()).toMatchObject({ wallpaper: "meadow", soundEnabled: true });
  });
});

describe("useIdle", () => {
  it("turns idle after the timeout and wakes on input", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useIdle(1000, true));
    expect(result.current[0]).toBe(false);
    act(() => vi.advanceTimersByTime(1001));
    expect(result.current[0]).toBe(true);
    act(() => window.dispatchEvent(new Event("keydown")));
    expect(result.current[0]).toBe(false);
  });

  it("never fires when disabled (reduced motion / preference off)", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useIdle(1000, false));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current[0]).toBe(false);
  });
});

describe("Sidekick", () => {
  const appear = () => {
    vi.useFakeTimers();
    render(<Sidekick mode="desktop" blocked={false} />);
    act(() => vi.advanceTimersByTime(SIDEKICK_DELAY_MS + 1));
  };

  it("shows a persona tip after a delay", () => {
    appear();
    expect(screen.getByText(/hiring a developer/i)).toBeInTheDocument();
  });

  it("hides for the session with ×, and forever with 'Don't show again'", () => {
    appear();
    fireEvent.click(screen.getByRole("button", { name: /hide flop/i }));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem("portfolioxp:sidekickHidden")).toBe("1");

    window.sessionStorage.clear();
    appear();
    fireEvent.click(screen.getAllByRole("button", { name: /don't show flop again/i })[0]);
    expect(usePreferences.getState().sidekickDismissed).toBe(true);
  });

  it("steps aside when something important is open", () => {
    vi.useFakeTimers();
    render(<Sidekick mode="desktop" blocked />);
    act(() => vi.advanceTimersByTime(SIDEKICK_DELAY_MS + 1));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });
});

describe("Control Panel", () => {
  it("applies theme, wallpaper, sound and motion settings instantly", () => {
    render(<ControlPanelApp windowId="cp" />);
    fireEvent.click(screen.getByLabelText("Midnight"));
    expect(usePreferences.getState().theme).toBe("midnight");

    fireEvent.click(screen.getByRole("tab", { name: "Desktop" }));
    fireEvent.click(screen.getByLabelText("Desert Dusk"));
    expect(usePreferences.getState().wallpaper).toBe("dusk");

    fireEvent.click(screen.getByRole("tab", { name: "Sounds" }));
    fireEvent.click(screen.getByLabelText(/play system sounds/i));
    expect(usePreferences.getState().soundEnabled).toBe(true);

    fireEvent.click(screen.getByRole("tab", { name: "Accessibility" }));
    fireEvent.click(screen.getByLabelText("Reduce motion"));
    expect(usePreferences.getState().reduceMotion).toBe(true);
  });
});
