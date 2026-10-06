"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { person } from "@/data";
import styles from "./Avatar.module.css";

const initials = person.name
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

/**
 * The owner's photo (person.avatar, Cloudinary) in an XP-style framed tile.
 * Falls back to an initials tile if the image can't load, so a missing asset never shows a broken image.
 */
export function Avatar({ size, className }: { size: number; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={person.name}
        className={clsx(styles.avatar, styles.fallback, className)}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={person.avatar}
      alt={person.name}
      width={size}
      height={size}
      className={clsx(styles.avatar, className)}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      // A server-rendered <img> can fail before hydration, when onError isn't attached yet.
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) setFailed(true);
      }}
    />
  );
}
