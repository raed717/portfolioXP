/**
 * The portfolio as a virtual file system (THEME_CONTEXT.md §6, §11.3).
 * Explorer, Terminal and the Start menu all derive from this tree — edit content in ./content, not here.
 */
import {
  CV_PDF_PATH,
  certifications,
  education,
  experience,
  languages,
  person,
  principles,
  projects,
  skills,
} from "./index";
import type { Project } from "@/types/content";
import { extOf, folder, textFile, type FileNode, type FolderNode, type VNode } from "@/lib/vfs";
import { slugify } from "@/lib/slugify";

function lines(...rows: (string | false | null | undefined)[]): string {
  return rows.filter((r): r is string => typeof r === "string").join("\n");
}

function bullets(items: string[]): string {
  return items.map((i) => `  - ${i}`).join("\n");
}

/** README per §6.2. Fields with no source data are omitted rather than invented (§15.5). */
function projectReadme(p: Project): string {
  const links = [p.githubUrl, p.liveUrl].filter(Boolean).join(", ");
  return lines(
    `PROJECT:   ${p.title}`,
    p.role && `ROLE:      ${p.role}`,
    p.period && `PERIOD:    ${p.period}`,
    `PROBLEM:   ${p.description}`,
    p.longDescription && `SOLUTION:  ${p.longDescription}`,
    `STACK:     ${p.technologies.join(", ")}`,
    p.results && `RESULTS:   ${p.results}`,
    p.features.length > 0 && `FEATURES:\n${bullets(p.features)}`,
    links && `LINKS:     ${links}`,
  );
}

function stackIni(p: Project): string {
  return lines("[stack]", ...p.technologies.map((t, i) => `item${i + 1}=${t}`));
}

function screenshotFile(src: string, index: number): FileNode {
  const ext = extOf(src) === "jpg" ? "jpg" : "png";
  return { type: "file", name: `screenshot-${index + 1}.${ext}`, ext, src };
}

function projectFolder(p: Project): FolderNode {
  const children: VNode[] = [
    textFile("README.txt", projectReadme(p)),
    folder("screenshots", p.screenshots.map(screenshotFile)),
    textFile("stack.ini", stackIni(p)),
  ];
  if (p.liveUrl || p.githubUrl) {
    children.push({
      type: "file",
      name: "demo.exe",
      ext: "exe",
      meta: { url: p.liveUrl ?? p.githubUrl, repo: p.githubUrl, projectSlug: p.slug },
    });
  }
  return { ...folder(p.title, children), meta: { projectSlug: p.slug } };
}

const aboutMe = lines(
  `Hi, I'm ${person.name} - ${person.role} based in ${person.location}.`,
  "",
  person.tagline,
  "",
  person.summary,
  "",
  person.availability,
);

const experienceFiles = experience.map((e) =>
  textFile(
    `${slugify(`${e.company} ${e.role}`)}.txt`,
    lines(
      `${e.role} @ ${e.company}`,
      `${e.location} | ${e.period}`,
      "",
      e.summary,
      "",
      `Impact: ${e.impact}`,
      "",
      "Highlights:",
      bullets(e.highlights),
      "",
      `Tools: ${e.tools.join(", ")}`,
    ),
  ),
);

const educationFiles = education.map((e) =>
  textFile(
    `${slugify(e.institution)}.txt`,
    lines(
      e.degree,
      `${e.institution} - ${e.location} | ${e.period}`,
      "",
      e.description,
      "",
      bullets(e.achievements),
    ),
  ),
);

const certificationsFile = textFile(
  "certifications.txt",
  certifications
    .map((c) => lines(`${c.name} - ${c.issuer} (${c.date})`, c.link && `  ${c.link}`))
    .join("\n\n"),
);

export const fsRoot: FolderNode = folder("", [
  folder(
    "My Documents",
    [
      folder("Projects", projects.map(projectFolder)),
      folder("Experience", experienceFiles),
      folder("Education", [...educationFiles, certificationsFile]),
      folder("Personal", [
        textFile("principles.txt", bullets(principles)),
        textFile("languages.txt", languages.map((l) => `${l.name}: ${l.level}`).join("\n")),
        textFile("skills.txt", skills.map((g) => `${g.title}\n${bullets(g.items)}`).join("\n\n")),
      ]),
    ],
    "folder-documents",
  ),
  textFile("about_me.txt", aboutMe),
  { type: "file", name: "Resume.pdf", ext: "pdf", src: CV_PDF_PATH },
  { type: "file", name: "do_not_open.exe", ext: "exe", meta: { easterEgg: "bsod" } },
  folder("Recycle Bin", [], "recycle-empty"),
]);

export const PATHS = {
  documents: "/My Documents",
  projects: "/My Documents/Projects",
  aboutMe: "/about_me.txt",
  resume: "/Resume.pdf",
  recycleBin: "/Recycle Bin",
} as const;
