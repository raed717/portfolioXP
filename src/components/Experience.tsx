"use client";

import { BlueScreen } from "@/components/screens/BlueScreen";
import { BootScreen } from "@/components/screens/BootScreen";
import { GoodbyeScreen } from "@/components/screens/GoodbyeScreen";
import { LoginScreen } from "@/components/screens/LoginScreen";
import { StandbyScreen } from "@/components/screens/StandbyScreen";
import { Desktop } from "@/components/shell/Desktop";
import { useApplyPreferences } from "@/hooks/useApplyPreferences";
import { useSession } from "@/store/session";

/** Experience flow (§4): Boot → Login → Desktop → Shutdown. Overlays keep the desktop mounted underneath. */
export default function Experience() {
  const phase = useSession((s) => s.phase);
  useApplyPreferences();

  const desktopVisible = phase === "desktop" || phase === "standby" || phase === "bsod";

  return (
    <>
      {phase === "boot" && <BootScreen />}
      {phase === "login" && <LoginScreen />}
      {desktopVisible && <Desktop inert={phase !== "desktop"} />}
      {phase === "standby" && <StandbyScreen />}
      {phase === "bsod" && <BlueScreen />}
      {phase === "shutdown" && <GoodbyeScreen />}
    </>
  );
}
