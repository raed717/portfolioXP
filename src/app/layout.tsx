import type { Metadata, Viewport } from "next";
import { person } from "@/data";
import "./globals.css";

export const metadata: Metadata = {
  title: `${person.name} — ${person.role}`,
  description: person.tagline,
  authors: [{ name: person.name, url: person.github }],
  openGraph: {
    title: `${person.name} — ${person.role}`,
    description: person.tagline,
    type: "profile",
  },
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
      </body>
    </html>
  );
}
