"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { person } from "@/data";
import { ACCOUNTS } from "@/data/accounts";
import { useSession } from "@/store/session";
import styles from "./screens.module.css";

/** Login screen (§4.2): pick a persona. No real authentication. */
export function LoginScreen() {
  const logIn = useSession((s) => s.logIn);
  const setPhase = useSession((s) => s.setPhase);
  const firstAccountRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstAccountRef.current?.focus();
  }, []);

  return (
    <div className={styles.login}>
      <div className={styles.loginBand} aria-hidden />
      <main className={styles.loginMain}>
        <section className={styles.loginBrand}>
          <Avatar size={72} />
          <h1 className={styles.loginName}>{person.name}</h1>
          <p className={styles.loginRole}>{person.role}</p>
          <p className={styles.loginPrompt}>Pick an account to get started</p>
        </section>
        <div className={styles.loginDivider} aria-hidden />
        <ul className={styles.accounts} aria-label="Accounts">
          {ACCOUNTS.map((account, index) => (
            <li key={account.persona}>
              <button
                ref={index === 0 ? firstAccountRef : undefined}
                type="button"
                className={styles.account}
                onClick={() => logIn(account.persona)}
              >
                <Icon name={account.icon} size={48} className={styles.accountIcon} />
                <span className={styles.accountText}>
                  <strong>{account.name}</strong>
                  <small>{account.description}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
      <footer className={styles.loginFooter}>
        <button type="button" className={styles.loginPower} onClick={() => setPhase("shutdown")}>
          <Icon name="power" size={24} />
          Turn off
        </button>
        <Link href="/cv" className={styles.quickView}>
          Quick View (plain CV)
        </Link>
      </footer>
    </div>
  );
}
