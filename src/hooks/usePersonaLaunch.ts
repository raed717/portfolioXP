"use client";

import { useEffect } from "react";
import { PATHS } from "@/data/fs";
import { QUICK_FACTS, WELCOME } from "@/data/messages";
import { openApp, openPath, showMessage } from "@/lib/launcher";
import { playSound } from "@/lib/sound";
import { useSession } from "@/store/session";

/** Opens the persona's first windows once per login (§4.2). */
export function usePersonaLaunch() {
  useEffect(() => {
    const { persona, personaLaunched, markPersonaLaunched } = useSession.getState();
    if (!persona || personaLaunched) return;
    markPersonaLaunched();
    // Logging in is a user gesture, so audio is allowed here (and only plays if enabled).
    playSound("startup");

    switch (persona) {
      case "recruiter":
        openPath(PATHS.resume);
        showMessage(QUICK_FACTS.title, QUICK_FACTS.message, "info");
        break;
      case "developer":
        openPath(PATHS.projects);
        openApp("terminal");
        break;
      case "guest":
        openPath(PATHS.aboutMe, { typing: true });
        showMessage(WELCOME.title, WELCOME.message, "info");
        break;
    }
  }, []);
}
