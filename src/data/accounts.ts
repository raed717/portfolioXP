/** Login accounts (§4.2). Each persona tailors the first view after login. */
import type { Persona } from "@/store/session";

export type Account = {
  persona: Persona;
  name: string;
  description: string;
  icon: string;
};

export const ACCOUNTS: Account[] = [
  {
    persona: "recruiter",
    name: "Recruiter",
    description: "Résumé and quick facts, straight away",
    icon: "user-recruiter",
  },
  {
    persona: "developer",
    name: "Fellow Dev",
    description: "Terminal and projects, no small talk",
    icon: "user-dev",
  },
  {
    persona: "guest",
    name: "Guest",
    description: "Just looking around? Welcome in",
    icon: "user-guest",
  },
];

export const START_LABEL = "RG";
export const OS_NAME = "Portfolio Edition";
