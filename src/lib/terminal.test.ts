import { describe, expect, it } from "vitest";
import { projects } from "@/data";
import { PATHS } from "@/data/fs";
import { complete, execute, prompt, tokenize } from "./terminal";

const ctx = { cwd: PATHS.documents, theme: "luna" as const };
const out = (input: string, c = ctx) =>
  execute(input, c)
    .lines.map((l) => l.text)
    .join("\n");

describe("tokenize", () => {
  it("splits on spaces and honours quotes", () => {
    expect(tokenize('cd "My Documents/Projects"')).toEqual(["cd", "My Documents/Projects"]);
    expect(tokenize("cat 'about_me.txt'")).toEqual(["cat", "about_me.txt"]);
    expect(tokenize('cd "My Doc')).toEqual(["cd", "My Doc"]);
  });
});

describe("execute", () => {
  it("shows an XP-style prompt", () => {
    expect(prompt(PATHS.projects)).toBe("C:\\My Documents\\Projects>");
  });

  it("navigates with cd (relative, .., C:\\ paths, case-insensitive) and rejects files", () => {
    expect(execute("cd projects", ctx).cwd).toBe(PATHS.projects);
    expect(execute("cd ..", ctx).cwd).toBe("/");
    expect(execute("cd C:\\My Documents\\Experience", ctx).cwd).toBe("/My Documents/Experience");
    expect(out("cd /about_me.txt")).toMatch(/directory name is invalid/i);
    expect(out("cd nowhere")).toMatch(/cannot find the path/i);
  });

  it("lists folders and prints files", () => {
    expect(out("ls")).toContain("<DIR>          Projects");
    expect(out("cat /about_me.txt")).toContain("Raed Guembri");
    expect(out("type ../about_me.txt")).toContain("Raed Guembri");
    expect(out("cat /Resume.pdf")).toMatch(/not a text file/);
  });

  it("opens projects by slug or title prefix", () => {
    const result = execute(`open ${projects[0].title.slice(0, 5)}`, ctx);
    expect(result.effects).toEqual([
      { type: "openPath", path: `${PATHS.projects}/${projects[0].title}` },
    ]);
    expect(out("open nope")).toMatch(/no project matches/i);
  });

  it("switches themes and validates names", () => {
    expect(execute("theme olive", ctx).effects).toEqual([{ type: "theme", theme: "olive" }]);
    expect(out("theme neon")).toMatch(/unknown theme/i);
  });

  it("has the hidden sudo hire-me easter egg", () => {
    const result = execute("sudo hire-me", ctx);
    expect(result.effects).toEqual([{ type: "openApp", appId: "mail" }]);
    expect(out("help")).not.toContain("sudo");
    expect(out("sudo rm -rf /")).toMatch(/sudoers/);
  });

  it("never prints the private email address", () => {
    expect(out("contact")).not.toMatch(/@/);
  });

  it("reports unknown commands like cmd.exe", () => {
    expect(out("dance")).toMatch(/'dance' is not recognized/);
  });
});

describe("complete", () => {
  it("completes command names", () => {
    expect(complete("exp", "/").value).toBe("experience ");
    expect(complete("c", "/").options).toEqual(expect.arrayContaining(["cd", "cat", "clear"]));
  });

  it("completes folder names with quotes when they contain spaces", () => {
    expect(complete("cd My D", "/").value).toBe('cd "My Documents/');
    expect(complete('cd "My Documents/Pro', "/").value).toBe('cd "My Documents/Projects/');
  });

  it("completes files for cat and project slugs for open", () => {
    expect(complete("cat abo", "/").value).toBe("cat about_me.txt");
    expect(complete(`open ${projects[0].slug.slice(0, 4)}`, "/").value).toBe(
      `open ${projects[0].slug}`,
    );
  });
});
