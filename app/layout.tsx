import type { Metadata } from "next";
import type { ReactNode } from "react";

import { site } from "@/lib/content";
import { resolveOgImage } from "@/lib/og-image";

/*
 * The typefaces of the design, self-hosted.
 *
 * Still not `next/font/google`, which downloads while building and would break
 * a build with no network. `next/font/local` reads the files sitting in
 * `app/fonts/`, so the build stays offline and the bytes are versioned here
 * rather than resolved out of a package.
 *
 * Those files are the `latin` subsets, and only the two weights the design
 * uses: Spanish accents and «ñ» live in latin, and cyrillic or greek would be
 * weight nobody on this site can read.
 *
 * The reason this is not a stylesheet import any more is `adjustFontFallback`.
 * A plain `@font-face` with `font-display: swap` shows the fallback first and
 * then reflows every line when the real face lands, because `system-ui` and
 * `Georgia` do not share metrics with these faces. `next/font` measures the
 * font file at build time and emits a fallback `@font-face` carrying
 * `size-adjust` and the ascent/descent overrides, so the swap keeps the text
 * where it was. The emitted stylesheet carries `size-adjust: 101.13%` for the
 * sans, `131.49%` for the mono and `118.46%` for the serif — measured, not
 * guessed, which is the part that could not be written by hand here.
 *
 * It does not buy a preload. The files are emitted under `static/media` with
 * the preloadable naming, but no `<link rel="preload">` reaches the prerendered
 * HTML, so the browser still discovers them through the CSS.
 *
 * `adjustFontFallback` takes `"Arial"` or `"Times New Roman"` and nothing else,
 * so the adjustment is computed against those rather than against the
 * `system-ui` in the token. They are close enough to the system faces for the
 * override to be worth far more than no override at all.
 */
import localFont from "next/font/local";

import "@/styles/tokens.css";
import "@/styles/global.css";

/*
 * Each family exposes a CSS variable rather than a class, because the token
 * layer is where `styles/tokens.css` already names the typefaces — the variable
 * slots straight into `--font-sans` and the rest of the stylesheet never learns
 * that the loading mechanism changed.
 *
 * The variable resolves to the real face followed by the adjusted fallback, so
 * the token appends only a last-resort family after it.
 */
const plexSans = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-sans-face",
  display: "swap",
  adjustFontFallback: "Arial",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mono-face",
  display: "swap",
  adjustFontFallback: "Arial",
});

/** The serif is measured against Times New Roman, the serif of the two options. */
const sourceSerif = localFont({
  src: [
    { path: "./fonts/source-serif-4-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/source-serif-4-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-serif-face",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

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

/**
 * The document shell. Spanish only, no i18n (9.1).
 *
 * The three font variables land on the same element `styles/tokens.css` uses
 * for `:root`, which is what lets the tokens reference them.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${plexSans.variable} ${plexMono.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
