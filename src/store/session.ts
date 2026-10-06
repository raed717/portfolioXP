/** Experience flow and persona (§4). Only `introSeen` is persisted (sessionStorage, see lib/storage). */
import { create } from "zustand";

export type Phase = "boot" | "login" | "desktop" | "standby" | "bsod" | "shutdown";
export type Persona = "recruiter" | "developer" | "guest";

type SessionStore = {
  phase: Phase;
  persona: Persona | null;
  /** True once the persona's welcome windows were opened for the current login. */
  personaLaunched: boolean;
  /** Set by Restart / Power on so the boot screen plays even if the intro was already seen. */
  replayIntro: boolean;
  setPhase: (phase: Phase) => void;
  logIn: (persona: Persona) => void;
  logOff: () => void;
  markPersonaLaunched: () => void;
  restart: () => void;
};

export const useSession = create<SessionStore>((set) => ({
  phase: "boot",
  persona: null,
  personaLaunched: false,
  replayIntro: false,
  setPhase: (phase) => set({ phase }),
  logIn: (persona) => set({ persona, phase: "desktop", personaLaunched: false }),
  logOff: () => set({ persona: null, phase: "login" }),
  markPersonaLaunched: () => set({ personaLaunched: true }),
  restart: () => set({ persona: null, phase: "boot", replayIntro: true }),
}));
