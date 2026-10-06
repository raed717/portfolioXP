"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { person } from "@/data";
import styles from "./screens.module.css";

const SPEED = 90; // px per second

/**
 * Screensaver (§7.6): the logo and name drift and bounce off the edges, shifting hue on each hit.
 * Animates with transform only. The parent unmounts it on any input (see useIdle).
 */
export function Screensaver() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let x = Math.random() * Math.max(0, window.innerWidth - box.offsetWidth);
    let y = Math.random() * Math.max(0, window.innerHeight - box.offsetHeight);
    let dx = SPEED;
    let dy = SPEED * 0.75;
    let hue = 0;
    let last = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const maxX = window.innerWidth - box.offsetWidth;
      const maxY = window.innerHeight - box.offsetHeight;
      x += dx * dt;
      y += dy * dt;
      if (x <= 0 || x >= maxX) {
        dx = -dx;
        x = Math.min(Math.max(x, 0), maxX);
        hue = (hue + 67) % 360;
      }
      if (y <= 0 || y >= maxY) {
        dy = -dy;
        y = Math.min(Math.max(y, 0), maxY);
        hue = (hue + 67) % 360;
      }
      box.style.transform = `translate(${x}px, ${y}px)`;
      box.style.filter = `hue-rotate(${hue}deg)`;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.screensaver} aria-hidden>
      <div ref={boxRef} className={styles.screensaverLogo}>
        <Icon name="logo" size={48} />
        <span>{person.name}</span>
      </div>
    </div>
  );
}
