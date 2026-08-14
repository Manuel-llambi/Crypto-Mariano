import type { Metadata } from "next";
import type { ReactNode } from "react";

import { site } from "@/lib/content";
import { resolveOgImage } from "@/lib/og-image";

/*
 * The typefaces of the design, self-hosted.
 *
 * `@fontsource` rather than `next/font/google`, which downloads while building
 * and would break a build with no network. The packages are pinned in
 * package-lock, so the bytes are the same on every machine.
 *
 * Only the `latin` subsets are imported: Spanish accents and «ñ» live there, and
 * pulling cyrillic or greek would be weight nobody on this site can read.
 */
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/source-serif-4/latin-400.css";
import "@fontsource/source-serif-4/latin-600.css";

import "@/styles/tokens.css";
import "@/styles/global.css";

/** Standard OpenGraph card size. Declaring it stops networks from cropping. */
const OG_SIZE = { width: 1200, height: 630 };

/**
 * Document metadata (10.1, 10.2).
 *
 * Every value comes from `content/site.ts`, already validated. The image path
 * goes through `resolveOgImage`, so building without the file in the repository
 * fails here rather than in production (10.3).
 */
export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  alternates: { canonical: site.canonicalUrl },
  openGraph: {
    type: "website",
    locale: "es_ES",
    title: site.title,
    description: site.description,
    url: site.canonicalUrl,
    siteName: site.name,
    images: [
      {
        url: resolveOgImage(site.ogImage),
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: site.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

/** The document shell. Spanish only, no i18n (9.1). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
