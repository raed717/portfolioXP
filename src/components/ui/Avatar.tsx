import clsx from "clsx";
import Image from "next/image";
import { person } from "@/data";
import styles from "./Avatar.module.css";

/** The owner's photo (person.avatar, Cloudinary) in an XP-style framed tile. */
export function Avatar({ size, className }: { size: number; className?: string }) {
  return (
    <Image
      src={person.avatar}
      alt={person.name}
      width={size}
      height={size}
      className={clsx(styles.avatar, className)}
      style={{ width: size, height: size }}
    />
  );
}
