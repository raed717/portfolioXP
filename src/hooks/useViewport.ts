"use client";

import { useSyncExternalStore } from "react";

type Viewport = { width: number; height: number };

const SERVER_VIEWPORT: Viewport = { width: 1280, height: 800 };
let cached: Viewport = SERVER_VIEWPORT;

function read(): Viewport {
  const { innerWidth: width, innerHeight: height } = window;
  if (cached.width !== width || cached.height !== height) cached = { width, height };
  return cached;
}

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

export function useViewport(): Viewport {
  return useSyncExternalStore(subscribe, read, () => SERVER_VIEWPORT);
}
