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

/**
 * A footer destination.
 *
 * Unlike the header, these are **pages and addresses**, not section anchors, so
 * `href` is a plain string rather than the `Anchor` template type. That is a
 * deliberate reversal of the earlier design: the finished layout groups legal
 * and institutional links under headed columns, none of which is a section of
 * this page. The trade-off is that `Anchor` no longer guards them — the test of
 * 1.5 covers header anchors, and a wrong path here fails as a 404 instead of at
 * compile time.
 */
const FooterLinkSchema = z.strictObject({
  label: NonEmpty,
  href: NonEmpty,
});

const FooterColumnSchema = z.strictObject({
  title: NonEmpty,
  links: z.array(FooterLinkSchema).min(1),
});

export const FooterSchema = z.strictObject({
  description: NonEmpty,
  /**
   * The two headed link columns of the design.
   *
   * Two, not three: the fourth cell of the grid is the address block below,
   * which carries a heading but no link list.
   */
  columns: z.array(FooterColumnSchema).length(2),
  address: z.strictObject({
    title: NonEmpty,
    line: NonEmpty,
    emailLabel: NonEmpty,
    email: z.email(),
  }),
  legal: NonEmpty,
  /** The two technical notes on the right of the bottom rule. */
  notes: z.array(NonEmpty).length(2),
});

export type Footer = z.infer<typeof FooterSchema>;

/**
 * The access screen (out of the landing's numbered requirements).
 *
 * Copy only — no schema authenticates anything. All four screens work for real
 * now: `/acceso` since the login spec of 2026-08-17, and the three steps of
 * `/registro` since the sign-up spec of 2026-08-19.
 */
export const LoginSchema = z.strictObject({
  title: NonEmpty,
  subtitle: NonEmpty,
  emailLabel: NonEmpty,
  passwordLabel: NonEmpty,
  forgotLabel: NonEmpty,
  forgotHref: NonEmpty,
  submitLabel: NonEmpty,
  /**
   * What a rejected attempt says (2.4).
   *
   * One message, not one per kind of failure: 2.2 asks invalid credentials and
   * an account that does not exist to look the same, so that the screen never
   * tells a stranger which addresses are registered.
   */
  errorMessage: NonEmpty,
  protocol: NonEmpty,
});

/**
 * The three steps of the sign-up flow, in order.
 *
 * Each one is a screen of its own because each one is a single task: the
 * address, then the code that reaches it, then the account. They share the
 * shape of a screen — a title, a subtitle, one control, the protocol note —
 * and differ only in the fields they collect.
 *
 * No screen declares where its control leads. Those are routes, they live in
 * `lib/routes.ts`, and a path spelled in two places eventually disagrees with
 * itself.
 */
const StepSchema = z.strictObject({
  title: NonEmpty,
  subtitle: NonEmpty,
  submitLabel: NonEmpty,
  protocol: NonEmpty,
});

export const SignupEmailSchema = StepSchema.extend({
  emailLabel: NonEmpty,
  /**
   * A rejection of what was typed (1.2, 1.4).
   *
   * One text for every cause, because the causes must not be told apart: an
   * empty address, a malformed one, an instance that did not answer and an
   * address that already has an account all end here. Naming any of them would
   * turn the screen into a way of asking which addresses are registered (1.3).
   */
  errorMessage: NonEmpty,
  /**
   * Not a rejection at all (4.3).
   *
   * This one is for someone who did nothing wrong: they reached step 2 with no
   * pending address, because the cookie expired or was never written. The
   * criterion asks to send them back here *with a message*, and the message has
   * to say what to do about it — ask for a new code. Sharing the text with
   * `errorMessage` would satisfy the schema and not the criterion.
   */
  expiredMessage: NonEmpty,
});

export const SignupCodeSchema = StepSchema.extend({
  codeLabel: NonEmpty,
  resendLabel: NonEmpty,
  /**
   * One text for the three ways a code fails (2.2).
   *
   * Wrong, expired and already used are indistinguishable on purpose, for the
   * same reason step 1 keeps its causes to itself.
   */
  errorMessage: NonEmpty,
});

export const SignupAccountSchema = StepSchema.extend({
  emailLabel: NonEmpty,
  passwordLabel: NonEmpty,
  /**
   * Two texts here, and the asymmetry with the steps above is deliberate (3.2).
   *
   * By this point the visitor has proved the mailbox is theirs, so there is
   * nothing left to hide from them, and a generic message would leave them
   * guessing what to correct. `weak` is the instance's password policy talking;
   * `generic` is everything else.
   *
   * A strict object of exactly two keys: a third reason would be a third branch
   * in the action, and 3.2 asks for these two.
   */
  errorMessages: z.strictObject({ weak: NonEmpty, generic: NonEmpty }),
});

export const SignupSchema = z.strictObject({
  email: SignupEmailSchema,
  code: SignupCodeSchema,
  account: SignupAccountSchema,
});

export const AccessSchema = z.strictObject({
  login: LoginSchema,
  signup: SignupSchema,
});

export type LoginContent = z.infer<typeof LoginSchema>;
export type SignupEmailContent = z.infer<typeof SignupEmailSchema>;
export type SignupCodeContent = z.infer<typeof SignupCodeSchema>;
export type SignupAccountContent = z.infer<typeof SignupAccountSchema>;

/**
 * The student dashboard (out of the landing's numbered requirements).
 *
 * Copy plus a sample record. The syllabus is not part of it: `/panel` reads the
 * same modules as the landing, so this only describes where the student stands
 * in them.
 *
 * `record` is strict for the same reason `ProgramSchema` is (3.4): module codes
 * are derived from the position in the syllabus, so a `currentModuleCode` here
 * would be a second source of truth, and the strict object turns it into an
 * error naming the surplus key instead of a value silently ignored.
 */
const PanelNavItemSchema = z.strictObject({
  /** A key the component resolves to a route — never an address itself. */
  id: NonEmpty,
  icon: NonEmpty,
  label: NonEmpty,
});

export type PanelNavItem = z.infer<typeof PanelNavItemSchema>;

/** A share of something, as the interface writes it: whole percent, 0 to 100. */
const Percent = z.number().int().min(0).max(100);

export const PanelRecordSchema = z.strictObject({
  /** Zero-based position in the syllabus; the range is checked against it later. */
  currentModuleIndex: z.number().int().nonnegative(),
  currentModulePercent: Percent,
  overallPercent: Percent,
  hoursSpent: z.number().nonnegative(),
  estimatedMinutes: z.number().int().positive(),
  attachmentCount: z.number().int().nonnegative(),
});

export type PanelRecord = z.infer<typeof PanelRecordSchema>;

export const PanelSchema = z.strictObject({
  title: NonEmpty,
  student: z.strictObject({
    name: NonEmpty,
    statusLabel: NonEmpty,
    statusValue: NonEmpty,
  }),
  nav: z.array(PanelNavItemSchema).min(1),
  settingsLabel: NonEmpty,
  logoutLabel: NonEmpty,
  welcome: z.strictObject({
    eyebrow: NonEmpty,
    greeting: NonEmpty,
    body: NonEmpty,
    /** Shown instead of `body` while the record shows no progress at all. */
    startBody: NonEmpty,
  }),
  /**
   * Two branches of the same card, and both are required.
   *
   * Which one the screen shows follows from the record: a student with nothing
   * done is told to start, everyone else to resume. Making the second branch
   * optional would let a content edit leave a new student reading «Reanudar»
   * over a course they never opened.
   */
  continueCard: z.strictObject({
    eyebrow: NonEmpty,
    startEyebrow: NonEmpty,
    durationLabel: NonEmpty,
    attachmentsLabel: NonEmpty,
    ctaLabel: NonEmpty,
    startCtaLabel: NonEmpty,
  }),
  progressCard: z.strictObject({
    title: NonEmpty,
    completedLabel: NonEmpty,
    modulesLabel: NonEmpty,
    hoursLabel: NonEmpty,
    hoursSuffix: NonEmpty,
  }),
  modules: z.strictObject({
    filterLabel: NonEmpty,
    passedBadge: NonEmpty,
    passedLabel: NonEmpty,
    currentBadge: NonEmpty,
    availableBadge: NonEmpty,
    availableLabel: NonEmpty,
    lockedBadge: NonEmpty,
    lockedPrefix: NonEmpty,
  }),
  record: PanelRecordSchema,
});

export type PanelContent = z.infer<typeof PanelSchema>;

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
    eyebrow: NonEmpty,
    headline: NonEmpty,
    body: NonEmpty,
    ctaLabel: NonEmpty,
    /** The reassurance line under the button in the finished design. */
    footnote: NonEmpty,
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
  icon: NonEmpty,
  title: NonEmpty,
  description: NonEmpty,
});

export type MethodologyBlock = z.infer<typeof MethodologyBlockSchema>;

/** Exactly 2 blocks (2.4). */
export const MethodologySchema = z.array(MethodologyBlockSchema).length(2);

const SealSchema = z.strictObject({ icon: NonEmpty, name: NonEmpty, detail: NonEmpty });

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
