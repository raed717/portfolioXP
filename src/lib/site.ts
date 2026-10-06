/**
 * Canonical site identity for SEO (metadata, sitemap, robots, JSON-LD, llms.txt).
 * `www.` and preview hosts redirect/canonicalize to SITE_URL.
 */
import type { Metadata } from "next";
import { person } from "@/data";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://raed.guembri.tn").replace(
  /\/$/,
  "",
);
export const SITE_HOST = new URL(SITE_URL).host;
export const SITE_NAME = `${person.name} — Portfolio`;

/** Primary search phrase the homepage should rank for. */
export const SITE_TITLE = `${person.name} — ${person.role}`;
/** Kept under ~160 characters so search results don't truncate it. */
export const SITE_DESCRIPTION = `${person.name}, ${person.role} in ${person.location}. ${person.availability}`;

/** Shared Open Graph fields. A page that sets `openGraph` replaces the parent's, so spread these in. */
export const OG_DEFAULTS: Pick<OpenGraph, "siteName" | "locale" | "images"> = {
  siteName: SITE_NAME,
  locale: "en_US",
  images: [
    { url: "/opengraph-image", width: 1200, height: 630, alt: `${person.name}, ${person.role}` },
  ],
};

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
