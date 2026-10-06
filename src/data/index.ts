/**
 * Single entry point for owner content (THEME_CONTEXT.md §6, §11).
 * JSON is authored in ./content and normalized here so components never deal with raw flags.
 */
import profileJson from "./content/profile.json";
import educationJson from "./content/education.json";
import projectsJson from "./content/projects.json";
import type { EducationFile, Profile, Project, RawProject } from "@/types/content";
import { slugify } from "@/lib/slugify";

export const profile = profileJson as Profile;
export const { person, skills, experience, languages, principles } = profile;

const educationFile = educationJson as EducationFile;
export const { education, certifications } = educationFile;

export const CV_PDF_PATH = "/cv/raed-guembri-resume.pdf";

/**
 * The `*_available` flags in projects.json are the source of truth: a link is shown only when
 * its flag is explicitly true (some URLs are placeholders copied from another project).
 */
function usableUrl(url: string | undefined, available: boolean | undefined): string | null {
  if (available !== true || !url || url === "#") return null;
  return url;
}

export function normalizeProject(raw: RawProject): Project {
  const screenshots = raw.detailImages?.length ? raw.detailImages : [raw.image];
  const job = raw.experienceCompany
    ? experience.find((e) => e.company === raw.experienceCompany)
    : undefined;
  return {
    slug: slugify(raw.title),
    title: raw.title,
    description: raw.description,
    longDescription: raw.longDescription ?? null,
    technologies: raw.technologies,
    cover: raw.image,
    screenshots,
    features: raw.features ?? [],
    githubUrl: usableUrl(raw.github, raw.github_available),
    liveUrl: usableUrl(raw.live, raw.live_available),
    role: job ? `${job.role} at ${job.company}` : null,
    period: job?.period ?? null,
    results: job?.impact ?? null,
  };
}

export const projects: Project[] = (projectsJson.projects as RawProject[]).map(normalizeProject);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
