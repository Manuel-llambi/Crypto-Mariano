import { z } from "zod";

import { SECTION_IDS, type Anchor } from "@/lib/nav/sections";

/**
 * Any displayed text: never empty, never whitespace only (2.8).
 *
 * `.trim()` runs before `.min(1)`, so a value made only of spaces is rejected
 * rather than stored as a blank string.
 */
const NonEmpty = z.string().trim().min(1);

/**
 * A syllabus module, discriminated by `status` (4.1).
 *
 * Both branches are strict objects: that is what turns 3.4 and 4.6 from
 * intention into guarantee. A `code` on the module, a `videoMinutes` on a
 * coming-soon module or a `summary` where it does not belong stops being an
 * ignored field and becomes an error naming the surplus key.
 */
export const ModuleSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("available"),
    title: NonEmpty,
    summary: NonEmpty.optional(), // 4.3 / 4.4
    videoMinutes: z.number().int().positive(), // 4.7
  }),
  z.strictObject({
    status: z.literal("coming-soon"),
    title: NonEmpty,
    teaser: NonEmpty, // 4.2
  }),
]);

export const ProgramSchema = z.strictObject({
  description: NonEmpty,
  modules: z.array(ModuleSchema).min(1), // 2.5, 4.8
});

/**
 * The anchor set, derived from `SECTION_IDS` so navigation can never point at a
 * section that does not exist (1.5).
 *
 * The type already forbids a stray anchor at compile time; this is the runtime
 * half of the same guarantee, for content that reaches the schema as plain data.
 * The tuple assertion only restates what `SECTION_IDS` guarantees — a non-empty
 * list — which `.map()` erases from the inferred type.
 */
const AnchorSchema = z.enum(
  SECTION_IDS.map((id): Anchor => `#${id}`) as [Anchor, ...Anchor[]],
);

const NavItemSchema = z.strictObject({
  label: NonEmpty,
  href: AnchorSchema,
});

/** Header navigation: at least one destination, all of them real sections (1.4, 1.5). */
export const NavSchema = z.array(NavItemSchema).min(1);

export const FooterSchema = z.strictObject({
  description: NonEmpty,
  links: NavSchema, // 1.6 — the footer repeats the same anchor guarantee
  newsletter: z.strictObject({ label: NonEmpty, href: z.url() }),
  legal: NonEmpty,
});

export const SiteSchema = z.strictObject({
  name: NonEmpty,
  title: NonEmpty, // 10.1
  description: NonEmpty, // 10.1
  canonicalUrl: z.url(), // 10.2
  ogImage: NonEmpty, // 10.3 — a path inside the site, not an absolute address
  enrollLabel: NonEmpty, // 6.6 — one label, reused by every enrolment control
  loginLabel: NonEmpty,
  hero: z.strictObject({
    eyebrow: NonEmpty,
    headline: NonEmpty,
    subheadline: NonEmpty,
    ctaLabel: NonEmpty,
    imageAlt: NonEmpty, // 9.3
  }),
  finalCta: z.strictObject({
    headline: NonEmpty,
    body: NonEmpty,
    ctaLabel: NonEmpty,
  }),
});

export type HeroContent = z.infer<typeof SiteSchema>["hero"];
export type FinalCtaContent = z.infer<typeof SiteSchema>["finalCta"];

const AudienceProfileSchema = z.strictObject({
  icon: NonEmpty,
  title: NonEmpty,
  description: NonEmpty,
});

export type AudienceProfile = z.infer<typeof AudienceProfileSchema>;

/** Exactly 4 profiles (2.4). */
export const AudienceSchema = z.array(AudienceProfileSchema).length(4);

const MethodologyBlockSchema = z.strictObject({
  title: NonEmpty,
  description: NonEmpty,
});

export type MethodologyBlock = z.infer<typeof MethodologyBlockSchema>;

/** Exactly 2 blocks (2.4). */
export const MethodologySchema = z.array(MethodologyBlockSchema).length(2);

const SealSchema = z.strictObject({ name: NonEmpty, detail: NonEmpty });

/** Exactly 3 trust seals (2.4). */
export const SealsSchema = z.array(SealSchema).length(3);

const MetricSchema = z.strictObject({ value: NonEmpty, label: NonEmpty });

/** Exactly 2 headline metrics (2.4). */
export const MetricsSchema = z.array(MetricSchema).length(2);

export const SocialProofSchema = z.strictObject({
  title: NonEmpty,
  description: NonEmpty,
  seals: SealsSchema,
  metrics: MetricsSchema,
});

export type Seal = z.infer<typeof SealSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type SocialProof = z.infer<typeof SocialProofSchema>;

/**
 * An update entry (2.6).
 *
 * `date` is stored as ISO `YYYY-MM` and nothing else: the month range is part of
 * the pattern, so `2026-13` and `2026-00` are rejected along with any other
 * shape. The displayed label is derived by `formatMonth`, never declared here —
 * the strict object is what enforces that.
 */
export const UpdateSchema = z.strictObject({
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  title: NonEmpty,
  description: NonEmpty,
});

export type Update = z.infer<typeof UpdateSchema>;

/** At least one update (2.5). */
export const UpdatesSchema = z.array(UpdateSchema).min(1);

/** 5.3 — an entry needs both its statement and its answer. */
export const FaqSchema = z.strictObject({
  question: NonEmpty,
  answer: NonEmpty,
});

export type FaqEntry = z.infer<typeof FaqSchema>;

/** At least one question (2.5). */
export const FaqListSchema = z.array(FaqSchema).min(1);
