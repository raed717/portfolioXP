import { describe, expect, it } from "vitest";
import { normalizeProject } from "./index";

const base = { title: "Demo App", description: "d", technologies: ["React"], image: "/x.png" };

describe("normalizeProject", () => {
  it("turns '#' and unavailable flags into null links", () => {
    const p = normalizeProject({
      ...base,
      github: "#",
      live: "https://x.dev",
      live_available: false,
    });
    expect(p.githubUrl).toBeNull();
    expect(p.liveUrl).toBeNull();
  });

  it("hides links whose availability flag is missing", () => {
    const p = normalizeProject({
      ...base,
      github: "https://github.com/a/b",
      live: "https://x.dev",
    });
    expect(p.githubUrl).toBeNull();
    expect(p.liveUrl).toBeNull();
  });

  it("keeps flagged links and falls back to the cover as the only screenshot", () => {
    const p = normalizeProject({
      ...base,
      github: "https://github.com/a/b",
      github_available: true,
      live: "https://x.dev",
      live_available: true,
    });
    expect(p.slug).toBe("demo-app");
    expect(p.githubUrl).toBe("https://github.com/a/b");
    expect(p.liveUrl).toBe("https://x.dev");
    expect(p.screenshots).toEqual(["/x.png"]);
  });
});
