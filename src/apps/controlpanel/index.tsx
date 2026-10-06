"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import type { AppProps } from "@/apps/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tabs } from "@/components/ui/Tabs";
import { SIDEKICK_NAME } from "@/data/sidekick";
import { playSound } from "@/lib/sound";
import { writeSession } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import { WALLPAPERS } from "@/lib/wallpapers";
import { usePreferences } from "@/store/preferences";
import { useWindows } from "@/store/windows";
import styles from "./controlpanel.module.css";

/** Control Panel (§6, §2.3, §3.6, §7): skins, wallpaper, sound, screensaver, accessibility. Changes apply instantly. */
export default function ControlPanelApp({ windowId }: AppProps) {
  const close = useWindows((s) => s.close);
  const resetLayout = useWindows((s) => s.resetLayout);
  const prefs = usePreferences();
  const { setPreference } = prefs;

  const tabs = [
    {
      id: "themes",
      label: "Themes",
      content: (
        <Choice legend="Skin">
          {THEMES.map((t) => (
            <Option
              key={t.id}
              name={`${windowId}-theme`}
              checked={prefs.theme === t.id}
              onChange={() => setPreference("theme", t.id)}
              label={t.label}
            >
              <ThemePreview theme={t.id} />
            </Option>
          ))}
        </Choice>
      ),
    },
    {
      id: "desktop",
      label: "Desktop",
      content: (
        <Choice legend="Wallpaper">
          {Object.entries(WALLPAPERS).map(([id, w]) => (
            <Option
              key={id}
              name={`${windowId}-wallpaper`}
              checked={prefs.wallpaper === id}
              onChange={() => setPreference("wallpaper", id)}
              label={w.label}
            >
              <span
                className={styles.wallpaper}
                style={w.src ? { backgroundImage: `url(${w.src})` } : undefined}
              />
            </Option>
          ))}
        </Choice>
      ),
    },
    {
      id: "sounds",
      label: "Sounds",
      content: (
        <div className={styles.stack}>
          <Toggle
            checked={prefs.soundEnabled}
            onChange={(on) => {
              setPreference("soundEnabled", on);
              if (on) playSound("click", { force: true });
            }}
            label="Play system sounds"
            hint="Startup, window, notification and error sounds. Off by default; nothing ever autoplays."
          />
          <div className={styles.row}>
            <Button onClick={() => playSound("startup", { force: true })}>
              <Icon name="sound-on" size={16} /> Test sound
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "screensaver",
      label: "Screen Saver",
      content: (
        <div className={styles.stack}>
          <Toggle
            checked={prefs.screensaverEnabled}
            onChange={(on) => setPreference("screensaverEnabled", on)}
            label="Start the screen saver after 1 minute of inactivity"
            hint="Any key, click or mouse movement brings you back. It never runs while reduced motion is on."
          />
        </div>
      ),
    },
    {
      id: "accessibility",
      label: "Accessibility",
      content: (
        <div className={styles.stack}>
          <Choice legend="Animations" compact>
            {(
              [
                [null, "Follow my system setting"],
                [true, "Reduce motion"],
                [false, "Allow all animations"],
              ] as const
            ).map(([value, label]) => (
              <Option
                key={String(value)}
                name={`${windowId}-motion`}
                checked={prefs.reduceMotion === value}
                onChange={() => setPreference("reduceMotion", value)}
                label={label}
              />
            ))}
          </Choice>
          <Toggle
            checked={!prefs.sidekickDismissed}
            onChange={(on) => {
              setPreference("sidekickDismissed", !on);
              if (on) writeSession("sidekickHidden", "0");
            }}
            label={`Show ${SIDEKICK_NAME}, the assistant`}
          />
          <div className={styles.row}>
            <Button onClick={resetLayout}>Reset window positions</Button>
            <Button
              onClick={() => {
                prefs.reset();
                resetLayout();
              }}
            >
              Restore all defaults
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.panel}>
      <Tabs tabs={tabs} label="Control Panel" />
      <div className={styles.footer}>
        <Button onClick={() => close(windowId)}>OK</Button>
      </div>
    </div>
  );
}

function Choice({
  legend,
  compact,
  children,
}: {
  legend: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={clsx(styles.options, compact && styles.compact)}>{children}</div>
    </fieldset>
  );
}

function Option(props: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  children?: ReactNode;
}) {
  return (
    <label className={clsx(styles.option, props.checked && styles.selected)}>
      <input
        type="radio"
        name={props.name}
        checked={props.checked}
        onChange={props.onChange}
        className={props.children ? styles.hiddenRadio : undefined}
      />
      {props.children}
      <span>{props.label}</span>
    </label>
  );
}

function Toggle(props: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span>
        {props.label}
        {props.hint && <small className={styles.hint}>{props.hint}</small>}
      </span>
    </label>
  );
}

/** A miniature window and taskbar rendered with the skin's own tokens. */
function ThemePreview({ theme }: { theme: string }) {
  return (
    <span className={styles.preview} data-theme={theme} aria-hidden>
      <span className={styles.previewWindow}>
        <span className={styles.previewTitle} />
        <span className={styles.previewBody} />
      </span>
      <span className={styles.previewTaskbar}>
        <span className={styles.previewStart} />
      </span>
    </span>
  );
}
