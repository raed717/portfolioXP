"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Screensaver } from "@/components/screens/Screensaver";
import { ContextMenu } from "@/components/ui/ContextMenu";
import { WindowManager } from "@/components/window/WindowManager";
import { useLayoutMode } from "@/hooks/useBreakpoint";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useIdle } from "@/hooks/useIdle";
import { usePersonaLaunch } from "@/hooks/usePersonaLaunch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { playSound } from "@/lib/sound";
import { wallpaperSrc } from "@/lib/wallpapers";
import { usePreferences } from "@/store/preferences";
import { Announcer } from "./Announcer";
import { DesktopIcons } from "./DesktopIcons";
import { Sidekick } from "./Sidekick";
import { SoundEffects } from "./SoundEffects";
import { StartMenu } from "./StartMenu";
import { Taskbar } from "./Taskbar";
import { TurnOffDialog } from "./TurnOffDialog";
import styles from "./Desktop.module.css";

export const SCREENSAVER_IDLE_MS = 60_000;

/** The desktop shell (§4.3, §5): wallpaper, icons, windows, taskbar, Start menu, extras (§7). */
export function Desktop({ inert }: { inert?: boolean }) {
  const mode = useLayoutMode();
  const wallpaper = usePreferences((s) => s.wallpaper);
  const screensaverEnabled = usePreferences((s) => s.screensaverEnabled);
  const reducedMotion = useReducedMotion();
  const [startOpen, setStartOpen] = useState(false);
  const [turnOffOpen, setTurnOffOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const [idle] = useIdle(SCREENSAVER_IDLE_MS, !inert && screensaverEnabled && !reducedMotion);

  const toggleStart = useCallback(() => setStartOpen((open) => !open), []);
  useEffect(() => {
    if (startOpen) playSound("click");
  }, [startOpen]);
  const closeStart = useCallback((restoreFocus?: boolean) => {
    setStartOpen(false);
    if (restoreFocus) startButtonRef.current?.focus();
  }, []);

  usePersonaLaunch();
  useGlobalShortcuts({ onToggleStart: toggleStart });

  const src = wallpaperSrc(wallpaper);

  return (
    <div
      className={styles.desktop}
      style={src ? { backgroundImage: `url(${src})` } : undefined}
      inert={inert}
    >
      <DesktopIcons mode={mode} />
      <WindowManager />
      {startOpen && (
        <StartMenu
          onClose={closeStart}
          onTurnOff={() => setTurnOffOpen(true)}
          startButtonRef={startButtonRef}
        />
      )}
      <Taskbar
        mode={mode}
        startOpen={startOpen}
        onToggleStart={toggleStart}
        startButtonRef={startButtonRef}
      />
      <Sidekick mode={mode} blocked={Boolean(inert) || startOpen || turnOffOpen || idle} />
      {turnOffOpen && <TurnOffDialog onCancel={() => setTurnOffOpen(false)} />}
      <ContextMenu />
      <Announcer />
      <SoundEffects />
      {idle && <Screensaver />}
    </div>
  );
}
