"use client";

import type { AppProps } from "@/apps/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useWindows } from "@/store/windows";
import styles from "./message.module.css";

/** Reusable message box (§5.5, §7.4). Params: { message: string; icon?: "info" | "warning" | "error" | "question" }. */
export default function MessageApp({ windowId, params }: AppProps) {
  const close = useWindows((s) => s.close);
  const message = typeof params?.message === "string" ? params.message : "";
  const icon = typeof params?.icon === "string" ? params.icon : "info";

  return (
    <div className={styles.box}>
      <div className={styles.content}>
        <Icon name={icon} size={32} />
        <p className={styles.text}>{message}</p>
      </div>
      <div className={styles.actions}>
        <Button autoFocus onClick={() => close(windowId)}>
          OK
        </Button>
      </div>
    </div>
  );
}
