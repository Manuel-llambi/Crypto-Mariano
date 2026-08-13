import type { Metadata } from "next";
import type { ReactNode } from "react";

import { site } from "@/lib/content";
import { resolveOgImage } from "@/lib/og-image";

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
