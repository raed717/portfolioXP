/**
 * /llms.txt — a plain-markdown summary for AI answer engines (llmstxt.org convention).
 * Generated from src/data so it always matches the CV. Never includes private contact details.
 */
import { certifications, education, experience, person, projects, skills } from "@/data";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
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
    `- [Interactive portfolio](${absoluteUrl("/")}): the same content as a retro desktop`,
    `- [GitHub](${person.github})`,
    ...(person.linkedin ? [`- [LinkedIn](${person.linkedin})`] : []),
    "",
    "## Experience",
    "",
    ...experience.map((e) => `- ${e.role}, ${e.company} (${e.location}, ${e.period}): ${e.impact}`),
    "",
    "## Projects",
    "",
    ...projects.map((p) => {
      const link = p.liveUrl ?? p.githubUrl;
      const title = link ? `[${p.title}](${link})` : p.title;
      return `- ${title}: ${p.description} Stack: ${p.technologies.join(", ")}.`;
    }),
    "",
    "## Skills",
    "",
    ...skills.map((g) => `- ${g.title}: ${g.items.join(", ")}`),
    "",
    "## Education",
    "",
    ...education.map((e) => `- ${e.degree}, ${e.institution} (${e.period})`),
    ...certifications.map((c) => `- ${c.name}, ${c.issuer} (${c.date})`),
    "",
    "## Contact",
    "",
    `- Use the contact form at ${absoluteUrl("/")} (Contact Me) or reach out on GitHub.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
