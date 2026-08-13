import { audience as rawAudience } from "@/content/audience";
import { faq as rawFaq } from "@/content/faq";
import { footer as rawFooter } from "@/content/footer";
import { methodology as rawMethodology } from "@/content/methodology";
import { nav as rawNav } from "@/content/nav";
import { program as rawProgram } from "@/content/program";
import { socialProof as rawSocialProof } from "@/content/social-proof";
import { site as rawSite } from "@/content/site";
import { updates as rawUpdates } from "@/content/updates";

import { parseContent } from "./parse";
import {
  AudienceSchema,
  FaqListSchema,
  FooterSchema,
  MethodologySchema,
  NavSchema,
  ProgramSchema,
  SiteSchema,
  SocialProofSchema,
  UpdatesSchema,
} from "./schemas";
import { deriveProgram } from "@/lib/program/derive";

/**
 * The single entrance to the content (2.2).
 *
 * Validation runs at import time, so a malformed content file stops
 * `next build` instead of reaching a visitor. Nothing here touches the network:
 * every value arrives through a static import of a versioned file (2.1).
 */

export const site = parseContent("content/site.ts", SiteSchema, rawSite);
export const nav = parseContent("content/nav.ts", NavSchema, rawNav);
export const footer = parseContent("content/footer.ts", FooterSchema, rawFooter);
export const audience = parseContent("content/audience.ts", AudienceSchema, rawAudience);
export const methodology = parseContent(
  "content/methodology.ts",
  MethodologySchema,
  rawMethodology,
);
export const socialProof = parseContent(
  "content/social-proof.ts",
  SocialProofSchema,
  rawSocialProof,
);
export const faq = parseContent("content/faq.ts", FaqListSchema, rawFaq);

/**
 * Newest first (2.7).
 *
 * `date` is ISO `YYYY-MM`, so it sorts lexicographically — the file can declare
 * the entries in whatever order is convenient to edit.
 */
export const updates = parseContent("content/updates.ts", UpdatesSchema, rawUpdates)
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date));

/** Already derived: codes, module count and duration (3.1-3.6). */
export const program = deriveProgram(
  parseContent("content/program.ts", ProgramSchema, rawProgram),
);
