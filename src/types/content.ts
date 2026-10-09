/** Shapes of the owner's content files in src/data/content/*.json. */

export type Person = {
  name: string;
  role: string;
  location: string;
  github: string;
  linkedin?: string;
  avatar: string;
  tagline: string;
  summary: string;
  availability: string;
};

export type SkillGroup = { title: string; items: string[] };

export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  summary: string;
  impact: string;
  tools: string[];
  highlights: string[];
};

export type SpokenLanguage = { name: string; level: string };

export type Profile = {
  person: Person;
  skills: SkillGroup[];
  experience: Experience[];
  languages: SpokenLanguage[];
  principles: string[];
};

export type Education = {
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  achievements: string[];
};

export type Certification = {
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  link: string;
};

export type EducationFile = { education: Education[]; certifications: Certification[] };

/** Raw project entry as authored in projects.json (flags are optional and loosely typed). */
export type RawProject = {
  title: string;
  description: string;
  technologies: string[];
  image: string;
  github: string;
  live?: string;
  video?: string;
  detailsUrl?: string;
  github_available?: boolean;
  live_available?: boolean;
  video_available?: boolean;
  details_available?: boolean;
  detailImages?: string[];
  longDescription?: string;
  features?: string[];
  /** Links the project to an entry in profile.json experience (by company) for role/period/results. */
  experienceCompany?: string;
};

/** Normalized project used by every app. Unavailable links are `null`, never "#". */
export type Project = {
  slug: string;
  title: string;
  description: string;
  longDescription: string | null;
  technologies: string[];
  cover: string;
  screenshots: string[];
  features: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  videoUrl: string | null;
  /** From the linked experience entry, when there is one. */
  role: string | null;
  period: string | null;
  results: string | null;
};
