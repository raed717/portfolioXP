"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useWindows } from "@/store/windows";
import styles from "./UnavailableApp.module.css";

/** Friendly placeholder for programs that haven't shipped yet (§2.7, §7.4). */
export function UnavailableApp({ windowId, title }: { windowId: string; title: string }) {
  const close = useWindows((s) => s.close);
  return (
    <div className={styles.box}>
      <div className={styles.content}>
        <Icon name="warning" size={32} />
        <div>
          <p>
            <strong>{title}</strong> is still unpacking its boxes and will be ready in a future
            update.
          </p>
          <p>
            Need the facts right now? The <Link href="/cv">plain CV</Link> has everything.
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <Button autoFocus onClick={() => close(windowId)}>
          OK
        </Button>
      </div>
    </div>
  );
}
