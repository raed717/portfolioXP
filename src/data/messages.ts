/** Copy for system messages, built from owner content so nothing is invented (§8). */
import { experience, person } from "./index";

const current = experience[0];

export const QUICK_FACTS = {
  title: "Quick Facts",
  message: [
    `${person.name}, ${person.role}`,
    `Based in ${person.location}`,
    current ? `Currently: ${current.role} at ${current.company}` : null,
    "",
    person.availability,
  ]
    .filter((line) => line !== null)
    .join("\n"),
};

export const WELCOME = {
  title: "Welcome!",
  message:
    "Make yourself at home. Open any icon to explore, or use the Start menu at the bottom-left.\n\nIn a hurry? The Quick View CV icon has everything on one page.",
};
