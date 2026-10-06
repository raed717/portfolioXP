/**
 * Markdown for AI answer engines (llmstxt.org): `/llms.txt` is the index, `/llms-full.txt` the
 * complete CV. Built from src/data so it always matches the site. Never includes private contacts.
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
} from "@/data";
import { absoluteUrl } from "@/lib/site";

export function buildLlmsTxt({ full }: { full: boolean }): string {
  const projectLines = projects.flatMap((p) => {
    const link = p.liveUrl ?? p.githubUrl;
    const title = link ? `[${p.title}](${link})` : p.title;
    const head = `- ${title}: ${p.description} Stack: ${p.technologies.join(", ")}.`;
    if (!full) return [head];
    return [
      head,
      ...(p.role ? [`  - Role: ${p.role} (${p.period})`] : []),
      ...(p.results ? [`  - Results: ${p.results}`] : []),
      ...(p.longDescription ? [`  - ${p.longDescription}`] : []),
      ...p.features.map((f) => `  - ${f}`),
    ];
  });

  const experienceLines = experience.flatMap((e) => [
    `- ${e.role}, ${e.company} (${e.location}, ${e.period}): ${full ? e.summary : e.impact}`,
    ...(full
      ? [
          `  - Impact: ${e.impact}`,
          ...e.highlights.map((h) => `  - ${h}`),
          `  - Tools: ${e.tools.join(", ")}`,
        ]
      : []),
  ]);

  const lines = [
    `# ${person.name}`,
    "",
    `> ${person.role} based in ${person.location}. ${person.tagline}`,
    "",
    person.summary,
    "",
    person.availability,
    "",
    "## Key pages",
    "",
    `- [CV (plain HTML)](${absoluteUrl("/cv")}): full experience, projects, skills and education`,
    `- [CV (PDF)](${absoluteUrl(CV_PDF_PATH)})`,
    `- [Interactive portfolio](${absoluteUrl("/")}): the same content as a retro desktop`,
    ...(full ? [] : [`- [Full profile for LLMs](${absoluteUrl("/llms-full.txt")})`]),
    `- [GitHub](${person.github})`,
    ...(person.linkedin ? [`- [LinkedIn](${person.linkedin})`] : []),
    "",
    "## Experience",
    "",
    ...experienceLines,
    "",
    "## Projects",
    "",
    ...projectLines,
    "",
    "## Skills",
    "",
    ...skills.map((g) => `- ${g.title}: ${g.items.join(", ")}`),
    "",
    "## Education",
    "",
    ...education.flatMap((e) => [
      `- ${e.degree}, ${e.institution} (${e.location}, ${e.period})`,
      ...(full ? [`  - ${e.description}`, ...e.achievements.map((a) => `  - ${a}`)] : []),
    ]),
    ...certifications.map((c) => `- ${c.name}, ${c.issuer} (${c.date})`),
    ...(full
      ? [
          "",
          "## Languages",
          "",
          ...languages.map((l) => `- ${l.name}: ${l.level}`),
          "",
          "## Working principles",
          "",
          ...principles.map((p) => `- ${p}`),
        ]
      : []),
    "",
    "## Contact",
    "",
    `- Use the contact form at ${absoluteUrl("/")} (Contact Me), or reach out on GitHub${person.linkedin ? " or LinkedIn" : ""}.`,
    "",
  ];
  return lines.join("\n");
}

export function markdownResponse(body: string): Response {
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
