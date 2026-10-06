"use client";

import clsx from "clsx";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { languages, person, skills } from "@/data";
import styles from "./sysinfo.module.css";

const DRIVE_LETTERS = "CDEFGHIJ";
const totalSkills = skills.reduce((sum, g) => sum + g.items.length, 0);

const drives = skills.map((group, i) => ({
  letter: `${DRIVE_LETTERS[i] ?? "Z"}:`,
  ...group,
  /** Share of all listed skills: a layout metaphor, not a proficiency claim. */
  share: group.items.length / totalSkills,
}));

/** My Computer (§6): skill groups shown as drives, plus a "system" summary of the owner. */
export default function SysInfoApp() {
  const [selected, setSelected] = useState(drives[0]?.letter);
  const drive = drives.find((d) => d.letter === selected) ?? drives[0];

  return (
    <div className={styles.root}>
      <section className={styles.system} aria-labelledby="sys-title">
        <h2 id="sys-title" className={styles.heading}>
          System
        </h2>
        <div className={styles.systemBody}>
          <Avatar size={64} />
          <dl className={styles.facts}>
            <dt>Registered to</dt>
            <dd>{person.name}</dd>
            <dt>Role</dt>
            <dd>{person.role}</dd>
            <dt>Location</dt>
            <dd>{person.location}</dd>
            <dt>Languages</dt>
            <dd>{languages.map((l) => `${l.name} (${l.level})`).join(", ")}</dd>
            <dt>Status</dt>
            <dd>{person.availability}</dd>
          </dl>
        </div>
      </section>

      <section aria-labelledby="drives-title">
        <h2 id="drives-title" className={styles.heading}>
          Skill Drives
        </h2>
        <ul className={styles.drives}>
          {drives.map((d) => (
            <li key={d.letter}>
              <button
                type="button"
                className={clsx(styles.drive, d.letter === drive.letter && styles.active)}
                aria-pressed={d.letter === drive.letter}
                onClick={() => setSelected(d.letter)}
              >
                <Icon name="drive" size={32} />
                <span className={styles.driveInfo}>
                  <span className={styles.driveName}>
                    {d.title} ({d.letter})
                  </span>
                  <span className={styles.bar} aria-hidden>
                    <span
                      className={styles.fill}
                      style={{ width: `${Math.round(d.share * 100)}%` }}
                    />
                  </span>
                  <span className={styles.driveMeta}>
                    {d.items.length} of {totalSkills} skills installed
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {drive && (
        <section className={styles.contents} aria-live="polite" aria-labelledby="drive-contents">
          <h2 id="drive-contents" className={styles.heading}>
            Contents of {drive.letter} {drive.title}
          </h2>
          <ul className={styles.skills}>
            {drive.items.map((item) => (
              <li key={item} className={styles.skill}>
                <Icon name="exe" size={16} />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
