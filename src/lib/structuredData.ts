/**
 * JSON-LD builders (schema.org). Everything is derived from src/data so structured data never
 * drifts from visible content. No restricted/deprecated types (FAQPage, HowTo) are used.
 */
import { certifications, education, experience, languages, person, projects, skills } from "@/data";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const [city, country] = person.location.split(",").map((s) => s.trim());
const current = experience.find((e) => /present/i.test(e.period));
const sameAs = [person.github, person.linkedin].filter(Boolean) as string[];

export function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: person.name,
    jobTitle: person.role,
    description: person.summary,
    url: SITE_URL,
    image: person.avatar,
    sameAs,
    address: { "@type": "PostalAddress", addressLocality: city, addressCountry: country },
    knowsAbout: skills.flatMap((g) => g.items),
    knowsLanguage: languages.map((l) => ({ "@type": "Language", name: l.name })),
    ...(current && {
      worksFor: { "@type": "Organization", name: current.company },
    }),
    alumniOf: education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.institution,
      address: e.location,
    })),
    hasCredential: certifications.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.name,
      recognizedBy: { "@type": "Organization", name: c.issuer },
      ...(c.link && { url: c.link }),
    })),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

/** Homepage graph: the site plus the person it's about. */
export function homeGraph() {
  return { "@context": "https://schema.org", "@graph": [websiteSchema(), personSchema()] };
}

/** /cv graph: a ProfilePage about the person, with their projects as creative works. */
export function cvGraph() {
  const url = absoluteUrl("/cv");
  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema(),
      personSchema(),
      {
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        name: `${person.name} — CV`,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
        inLanguage: "en",
      },
      {
        "@type": "ItemList",
        name: `Projects by ${person.name}`,
        itemListElement: projects.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "CreativeWork",
            name: p.title,
            description: p.description,
            keywords: p.technologies.join(", "),
            image: p.cover.startsWith("http") ? p.cover : absoluteUrl(p.cover),
            creator: { "@id": PERSON_ID },
            ...((p.liveUrl ?? p.githubUrl) && { url: p.liveUrl ?? p.githubUrl }),
          },
        })),
      },
    ],
  };
}
