/**
 * Command interpreter for the Terminal app (THEME_CONTEXT.md §7.2). Pure: returns output lines,
 * the next working directory and side effects; the component applies effects through the launcher.
 */
import type { AppId } from "@/apps/types";
import { certifications, education, experience, person, projects, skills } from "@/data";
import { PATHS, fsRoot } from "@/data/fs";
import { toDisplayPath } from "@/lib/fileInfo";
import { THEMES, isThemeId, type ThemeId } from "@/lib/themes";
import { canonicalPath, getNode, resolvePath, type VNode } from "@/lib/vfs";

export type Tone = "command" | "error" | "accent" | "muted";
export type Line = { text: string; tone?: Tone };

export type Effect =
  | { type: "openPath"; path: string }
  | { type: "openApp"; appId: AppId }
  | { type: "theme"; theme: ThemeId }
  | { type: "clear" }
  | { type: "exit" };

export type Result = { lines: Line[]; cwd: string; effects: Effect[] };

type Context = { cwd: string; theme: ThemeId };
type Command = {
  summary: string;
  usage?: string;
  hidden?: boolean;
  /** What tab completion offers for this command's arguments. */
  completes?: "folders" | "files" | "paths" | "projects" | "themes";
  run: (args: string[], ctx: Context) => Partial<Result>;
};

export const HOME = PATHS.documents;

export function prompt(cwd: string): string {
  return `${toDisplayPath(cwd)}>`;
}

/** Splits on whitespace, honouring "double" and 'single' quotes (unterminated quotes run to the end). */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"?|'([^']*)'?|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input))) tokens.push(match[1] ?? match[2] ?? match[3]);
  return tokens;
}

/** Accepts C:\style, backslashes, relative and absolute paths. */
function toVfsPath(cwd: string, arg: string): string {
  const cleaned = arg.replace(/^[a-z]:/i, "").replace(/\\/g, "/");
  return resolvePath(cwd, cleaned || "/");
}

const text = (t: string, tone?: Tone): Line => ({ text: t, tone });
const blank = text("");
const error = (t: string) => ({ lines: [text(t, "error")] });

function findProject(query: string) {
  const q = query.toLowerCase();
  return (
    projects.find((p) => p.slug === q || p.title.toLowerCase() === q) ??
    projects.find((p) => p.slug.startsWith(q) || p.title.toLowerCase().startsWith(q))
  );
}

function listing(nodes: VNode[]): Line[] {
  if (nodes.length === 0) return [text("File Not Found", "muted")];
  const folders = nodes.filter((n) => n.type === "folder");
  const files = nodes.filter((n) => n.type === "file");
  return [
    ...folders.map((n) => text(`<DIR>          ${n.name}`, "accent")),
    ...files.map((n) => text(`               ${n.name}`)),
    text(`        ${files.length} File(s)   ${folders.length} Dir(s)`, "muted"),
  ];
}

const COMMANDS: Record<string, Command> = {
  help: {
    summary: "List available commands",
    run: () => ({
      lines: [
        text("Available commands:", "accent"),
        ...Object.entries(COMMANDS)
          .filter(([, c]) => !c.hidden)
          .map(([name, c]) => text(`  ${(c.usage ?? name).padEnd(18)} ${c.summary}`)),
        blank,
        text("Tip: Tab completes commands and paths, ↑/↓ browse history.", "muted"),
      ],
    }),
  },
  about: {
    summary: "Who I am",
    run: () => ({
      lines: [
        text(`${person.name} — ${person.role}`, "accent"),
        text(person.location, "muted"),
        blank,
        text(person.tagline),
        blank,
        text(person.summary),
        blank,
        text(person.availability, "accent"),
      ],
    }),
  },
  projects: {
    summary: "List projects",
    run: () => ({
      lines: [
        ...projects.map((p) => text(`  ${p.slug.padEnd(20)} ${p.description}`)),
        blank,
        text("Type `open <name>` to open a project folder.", "muted"),
      ],
    }),
  },
  open: {
    summary: "Open a project folder",
    usage: "open <project>",
    completes: "projects",
    run: ([query]) => {
      if (!query) return error("Usage: open <project>. Type `projects` for the list.");
      const project = findProject(query);
      if (!project) return error(`No project matches "${query}". Type \`projects\` for the list.`);
      return {
        lines: [text(`Opening ${project.title}…`, "muted")],
        effects: [{ type: "openPath", path: `${PATHS.projects}/${project.title}` }],
      };
    },
  },
  skills: {
    summary: "Skills by category",
    run: () => ({
      lines: skills.flatMap((g) => [text(g.title, "accent"), text(`  ${g.items.join(", ")}`)]),
    }),
  },
  experience: {
    summary: "Work timeline",
    run: () => ({
      lines: experience.flatMap((e) => [
        text(`${e.period.padEnd(22)} ${e.role} @ ${e.company}`, "accent"),
        text(`${"".padEnd(22)} ${e.summary}`, "muted"),
      ]),
    }),
  },
  education: {
    summary: "Degrees and certifications",
    run: () => ({
      lines: [
        ...education.map((e) => text(`${e.period.padEnd(12)} ${e.degree} — ${e.institution}`)),
        blank,
        ...certifications.map((c) => text(`${c.date.padEnd(12)} ${c.name} (${c.issuer})`, "muted")),
      ],
    }),
  },
  contact: {
    summary: "How to reach me",
    run: () => ({
      lines: [
        text(`GitHub    ${person.github}`),
        ...(person.linkedin ? [text(`LinkedIn  ${person.linkedin}`)] : []),
        text("Mail      type `mail` to write me a message", "accent"),
      ],
    }),
  },
  mail: {
    summary: "Write me a message",
    run: () => ({
      lines: [text("Opening a new message…", "muted")],
      effects: [{ type: "openApp", appId: "mail" }],
    }),
  },
  theme: {
    summary: "Show or switch the theme",
    usage: "theme [name]",
    completes: "themes",
    run: ([name], { theme }) => {
      if (!name) {
        return {
          lines: THEMES.map((t) =>
            text(`${t.id === theme ? "*" : " "} ${t.id.padEnd(8)} ${t.label}`),
          ),
        };
      }
      const id = name.toLowerCase();
      if (!isThemeId(id))
        return error(`Unknown theme "${name}". Try: ${THEMES.map((t) => t.id).join(", ")}.`);
      return {
        lines: [text(`Theme set to ${id}.`, "muted")],
        effects: [{ type: "theme", theme: id }],
      };
    },
  },
  ls: {
    summary: "List a folder",
    usage: "ls [path]",
    completes: "folders",
    run: ([arg], { cwd }) => {
      const path = arg ? toVfsPath(cwd, arg) : cwd;
      const node = getNode(fsRoot, path);
      if (!node) return error("The system cannot find the path specified.");
      if (node.type === "file") return { lines: [text(node.name)] };
      return {
        lines: [
          text(` Directory of ${toDisplayPath(canonicalPath(fsRoot, path) ?? path)}`, "muted"),
          blank,
          ...listing(node.children),
        ],
      };
    },
  },
  cd: {
    summary: "Change folder",
    usage: "cd [path]",
    completes: "folders",
    run: ([arg], { cwd }) => {
      if (!arg) return { lines: [text(toDisplayPath(cwd))] };
      const path = toVfsPath(cwd, arg);
      const node = getNode(fsRoot, path);
      if (!node) return error("The system cannot find the path specified.");
      if (node.type !== "folder") return error("The directory name is invalid.");
      return { cwd: canonicalPath(fsRoot, path) ?? path };
    },
  },
  cat: {
    summary: "Print a text file",
    usage: "cat <file>",
    completes: "files",
    run: ([arg], { cwd }) => {
      if (!arg) return error("Usage: cat <file>");
      const node = getNode(fsRoot, toVfsPath(cwd, arg));
      if (!node) return error("The system cannot find the file specified.");
      if (node.type === "folder") return error("Access is denied. (That's a folder; try `ls`.)");
      if (typeof node.content !== "string")
        return error(`${node.name} is not a text file. Try \`start ${node.name}\`.`);
      return { lines: node.content.split("\n").map((l) => text(l)) };
    },
  },
  start: {
    summary: "Open a file or folder in its program",
    usage: "start <path>",
    completes: "paths",
    run: ([arg], { cwd }) => {
      if (!arg) return error("Usage: start <path>");
      const path = toVfsPath(cwd, arg);
      if (!getNode(fsRoot, path)) return error("The system cannot find the file specified.");
      return { effects: [{ type: "openPath", path }] };
    },
  },
  pwd: {
    summary: "Print the current folder",
    run: (_, { cwd }) => ({ lines: [text(toDisplayPath(cwd))] }),
  },
  whoami: {
    summary: "Who are you?",
    run: () => ({ lines: [text("visitor\\curious — and very welcome here")] }),
  },
  echo: {
    summary: "Print text",
    usage: "echo <text>",
    run: (args) => ({ lines: [text(args.join(" "))] }),
  },
  clear: { summary: "Clear the screen", run: () => ({ effects: [{ type: "clear" }] }) },
  exit: { summary: "Close the terminal", run: () => ({ effects: [{ type: "exit" }] }) },
  sudo: {
    summary: "Run as administrator",
    hidden: true,
    run: (args) =>
      args.join(" ").toLowerCase() === "hire-me"
        ? {
            lines: [
              text("[sudo] password for recruiter: ********", "muted"),
              text("Access granted. Excellent decision.", "accent"),
              text("Opening a direct line to the developer…", "muted"),
            ],
            effects: [{ type: "openApp", appId: "mail" }],
          }
        : error(
            "visitor is not in the sudoers file. This incident will be reported to the recruiter.",
          ),
  },
};

const ALIASES: Record<string, string> = { dir: "ls", type: "cat", cls: "clear", "?": "help" };

export const COMMAND_NAMES = Object.keys(COMMANDS).filter((n) => !COMMANDS[n].hidden);

export function execute(input: string, ctx: Context): Result {
  const [rawName, ...args] = tokenize(input.trim());
  if (!rawName) return { lines: [], cwd: ctx.cwd, effects: [] };
  const name = ALIASES[rawName.toLowerCase()] ?? rawName.toLowerCase();
  const command = COMMANDS[name];
  if (!command) {
    return {
      lines: [
        text(`'${rawName}' is not recognized as an internal or external command.`, "error"),
        text("Type `help` for a list of commands.", "muted"),
      ],
      cwd: ctx.cwd,
      effects: [],
    };
  }
  // Like cmd.exe, path commands take the rest of the line as one path, so quotes are optional.
  const isPathCommand =
    command.completes && command.completes !== "projects" && command.completes !== "themes";
  const result = command.run(isPathCommand && args.length > 1 ? [args.join(" ")] : args, ctx);
  return { lines: result.lines ?? [], cwd: result.cwd ?? ctx.cwd, effects: result.effects ?? [] };
}

/** Tab completion. Returns the new input and, when ambiguous, the candidates to print. */
export function complete(input: string, cwd: string): { value: string; options: string[] } {
  const spaceIndex = input.indexOf(" ");
  if (spaceIndex === -1) {
    const options = COMMAND_NAMES.filter((n) => n.startsWith(input.toLowerCase()));
    return resolveCompletion(input, "", options, (o) => `${o} `);
  }

  const name =
    ALIASES[input.slice(0, spaceIndex).toLowerCase()] ?? input.slice(0, spaceIndex).toLowerCase();
  const kind = COMMANDS[name]?.completes;
  // An unclosed quote means the argument (a path with spaces) starts at that quote.
  const quotes = input.match(/"/g)?.length ?? 0;
  const isPath = kind === "folders" || kind === "files" || kind === "paths";
  const tokenStart =
    quotes % 2 === 1
      ? input.lastIndexOf('"')
      : isPath
        ? spaceIndex + 1
        : input.lastIndexOf(" ") + 1;
  const head = input.slice(0, tokenStart);
  const raw = input.slice(tokenStart).replace(/^"/, "");

  if (kind === "projects" || kind === "themes") {
    const pool = kind === "projects" ? projects.map((p) => p.slug) : THEMES.map((t) => t.id);
    const options = pool.filter((o) => o.startsWith(raw.toLowerCase()));
    return resolveCompletion(input, head, options, (o) => o);
  }
  if (!kind) return { value: input, options: [] };

  const normalized = raw.replace(/\\/g, "/");
  const slash = normalized.lastIndexOf("/");
  const dirPart = slash === -1 ? "" : normalized.slice(0, slash + 1);
  const prefix = (slash === -1 ? normalized : normalized.slice(slash + 1)).toLowerCase();
  const dir = getNode(fsRoot, toVfsPath(cwd, dirPart || "."));
  if (dir?.type !== "folder") return { value: input, options: [] };

  const candidates = dir.children.filter(
    (c) =>
      c.name.toLowerCase().startsWith(prefix) &&
      (kind === "paths" || kind === "files" || c.type === "folder"),
  );
  const names = candidates.map((c) => c.name);
  return resolveCompletion(
    input,
    head,
    names,
    (match) => {
      const node = candidates.find((c) => c.name === match)!;
      const full = `${dirPart}${match}${node.type === "folder" ? "/" : ""}`;
      const needsQuotes = /\s/.test(full) || input.slice(tokenStart).startsWith('"');
      if (!needsQuotes) return full;
      return node.type === "folder" ? `"${full}` : `"${full}"`;
    },
    dirPart,
  );
}

function resolveCompletion(
  input: string,
  head: string,
  options: string[],
  format: (option: string) => string,
  dirPart = "",
): { value: string; options: string[] } {
  if (options.length === 0) return { value: input, options: [] };
  if (options.length === 1) return { value: head + format(options[0]), options: [] };
  const common = commonPrefix(options);
  const current = input.slice(head.length).replace(/^"/, "");
  const extended = dirPart + common;
  const value =
    extended.length > current.replace(/\\/g, "/").length
      ? head +
        (/\s/.test(extended) || input.slice(head.length).startsWith('"')
          ? `"${extended}`
          : extended)
      : input;
  return { value, options };
}

function commonPrefix(values: string[]): string {
  let prefix = values[0];
  for (const v of values) {
    while (!v.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1);
  }
  return prefix;
}
