import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { projects } from "@/data";
import { PATHS } from "@/data/fs";
import PropertiesApp from "./index";

describe("Properties", () => {
  it("shows project tabs with stack and honest link states", () => {
    const project = projects.find((p) => !p.githubUrl)!;
    render(
      <PropertiesApp
        windowId="w"
        params={{ kind: "path", path: `${PATHS.projects}/${project.title}` }}
      />,
    );
    expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(project.description)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Tech Stack" }));
    expect(screen.getByText(project.technologies[0])).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Links" }));
    expect(screen.getByText("No public repository")).toBeInTheDocument();
  });

  it("moves between tabs with arrow keys", () => {
    render(
      <PropertiesApp
        windowId="w"
        params={{ kind: "path", path: `${PATHS.projects}/${projects[0].title}` }}
      />,
    );
    const general = screen.getByRole("tab", { name: "General" });
    general.focus();
    fireEvent.keyDown(general, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Tech Stack" })).toHaveFocus();
  });

  it("describes plain files with type, program and size", () => {
    render(<PropertiesApp windowId="w" params={{ kind: "path", path: PATHS.aboutMe }} />);
    expect(screen.getByText("Text Document")).toBeInTheDocument();
    expect(screen.getByText("Notepad")).toBeInTheDocument();
    expect(screen.getByText(/bytes|KB/)).toBeInTheDocument();
  });
});
