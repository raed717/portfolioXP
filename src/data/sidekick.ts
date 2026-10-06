/** Tips for Flop, the sidekick (§7.3). Persona-aware; actions use the launcher or a link. */
import type { AppId } from "@/apps/types";
import type { Persona } from "@/store/session";
import { PATHS } from "./fs";

export type TipAction =
  | { label: string; type: "path"; path: string }
  | { label: string; type: "app"; appId: AppId }
  | { label: string; type: "link"; href: string };

export type Tip = { id: string; text: string; action?: TipAction; personas?: Persona[] };

export const SIDEKICK_NAME = "Flop";

export const TIPS: Tip[] = [
  {
    id: "hiring",
    personas: ["recruiter"],
    text: "It looks like you're hiring a developer! Want the whole CV on one plain page?",
    action: { label: "Open Quick View", type: "link", href: "/cv" },
  },
  {
    id: "skills",
    personas: ["recruiter"],
    text: "In a hurry? My Computer lists every skill, grouped like disk drives.",
    action: { label: "Open My Computer", type: "app", appId: "sysinfo" },
  },
  {
    id: "terminal",
    personas: ["developer"],
    text: "Psst. The Command Prompt knows `projects`, `open` and Tab completion. Try `sudo` if you're feeling lucky.",
    action: { label: "Open Command Prompt", type: "app", appId: "terminal" },
  },
  {
    id: "readme",
    personas: ["developer"],
    text: "Every project folder has a README.txt and a stack.ini. Right-click one and pick Properties for the details.",
    action: { label: "Open My Projects", type: "path", path: PATHS.projects },
  },
  {
    id: "projects",
    personas: ["guest"],
    text: "New here? My Projects is the best place to start.",
    action: { label: "Open My Projects", type: "path", path: PATHS.projects },
  },
  {
    id: "demos",
    personas: ["guest", "developer"],
    text: "Some demos run live inside Web Voyager. Take one for a spin!",
    action: { label: "Open Web Voyager", type: "app", appId: "browser" },
  },
  {
    id: "contact",
    text: "Want to say hi? Contact Me sends a message straight to the inbox.",
    action: { label: "Write a message", type: "app", appId: "mail" },
  },
  {
    id: "right-click",
    text: "Try right-clicking things. Most of them have something to say.",
  },
  {
    id: "themes",
    text: "Not a fan of blue? Control Panel has other skins, wallpapers and sounds.",
    action: { label: "Open Control Panel", type: "app", appId: "controlpanel" },
  },
];

export function tipsFor(persona: Persona | null): Tip[] {
  return TIPS.filter((t) => !t.personas || (persona && t.personas.includes(persona)));
}
