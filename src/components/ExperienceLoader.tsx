"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import styles from "./screens/screens.module.css";

/**
 * The desktop depends on viewport, storage and user preferences, so it renders on the client only.
 * The server sends this lightweight fallback (with the fast path) until the shell chunk loads.
 */
const Experience = dynamic(() => import("./Experience"), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

export function ExperienceLoader() {
  return <Experience />;
}

function LoadingFallback() {
  return (
    <div className={styles.fallback} role="status">
      <p>Starting up…</p>
      <Link href="/cv">Quick View (plain CV)</Link>
    </div>
  );
}
