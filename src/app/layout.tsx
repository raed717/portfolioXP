import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { person, skills } from "@/data";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const [firstName, ...rest] = person.name.split(" ");

/** Site-wide defaults. Pages override title/description/canonical; og:image comes from opengraph-image.tsx. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${person.name}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: person.name, url: SITE_URL }],
  creator: person.name,
  keywords: [
    person.name,
    person.role,
    "Full-stack developer",
    "Software engineer Tunisia",
    person.location,
    ...skills.flatMap((g) => g.items).slice(0, 12),
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "profile",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    firstName,
    lastName: rest.join(" "),
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2a62d9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: browser extensions (LanguageTool's data-lt-installed, ColorZilla's
    // cz-shortcut-listen, …) and the theme preferences add attributes to <html>/<body>.
    // It only applies to the element's own attributes, not to its children.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <noscript>
          <p>
            This portfolio is an interactive desktop that needs JavaScript.{" "}
            <a href="/cv">Read the plain HTML CV instead.</a>
          </p>
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
