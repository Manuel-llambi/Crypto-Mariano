import { describe, expect, it } from "vitest";
import {
  AudienceSchema,
  FaqListSchema,
  FaqSchema,
  FooterSchema,
  MethodologySchema,
  MetricsSchema,
  NavSchema,
  SealsSchema,
  SiteSchema,
  SocialProofSchema,
  UpdateSchema,
  UpdatesSchema,
} from "./schemas";

const profile = { icon: "shield", title: "Fuerzas del orden", description: "Descripción" };
const methodBlock = { icon: "institutional", title: "Casos reales", description: "Descripción" };
const seal = { icon: "seal-doj", name: "Sello", detail: "Detalle" };
const metric = { value: "5000+", label: "investigadores" };
const update = { date: "2026-07", title: "Título", description: "Descripción" };
const faqEntry = { question: "¿Cuánto dura?", answer: "Lo que haga falta." };

const socialProof = {
  title: "Confianza",
  description: "Descripción",
  seals: [seal, seal, seal],
  metrics: [metric, metric],
};

const site = {
  name: "Crypto Crime Academy",
  title: "Título del documento",
  description: "Descripción del documento",
  canonicalUrl: "https://cryptocrime.academy",
  ogImage: "/og.png",
  enrollLabel: "Inscribite",
  loginLabel: "Iniciar sesión",
  hero: {
    eyebrow: "Investigación de criptoactivos",
    headline: "Titular",
    subheadline: "Subtítulo",
    ctaLabel: "Inscribite",
    imageAlt: "Panel de análisis de cadena",
  },
  finalCta: {
    eyebrow: "SESSION_INITIALIZE_REQUEST",
    headline: "Titular de cierre",
    body: "Texto",
    ctaLabel: "Inscribite",
    footnote: "Entorno certificado",
  },
};

const footer = {
  description: "Descripción del pie",
  links: [{ label: "Programa", href: "#programa" }],
  newsletter: { label: "Suscribirse", href: "https://cryptocrime.academy/newsletter" },
  legal: "© 2026 Crypto Crime Academy",
};

/** Replaces one entry of an array-shaped fixture to build a rejection case. */
const repeat = <T,>(item: T, times: number): T[] => Array.from({ length: times }, () => item);

describe("cardinalities required by 2.4", () => {
  it("requires exactly 4 audience profiles", () => {
    expect(AudienceSchema.safeParse(repeat(profile, 4)).success).toBe(true);
    expect(AudienceSchema.safeParse(repeat(profile, 3)).success).toBe(false);
    expect(AudienceSchema.safeParse(repeat(profile, 5)).success).toBe(false);
  });

  it("requires exactly 2 methodology blocks", () => {
    expect(MethodologySchema.safeParse(repeat(methodBlock, 2)).success).toBe(true);
    expect(MethodologySchema.safeParse(repeat(methodBlock, 1)).success).toBe(false);
    expect(MethodologySchema.safeParse(repeat(methodBlock, 3)).success).toBe(false);
  });

  it("requires exactly 3 trust seals", () => {
    expect(SealsSchema.safeParse(repeat(seal, 3)).success).toBe(true);
    expect(SealsSchema.safeParse(repeat(seal, 2)).success).toBe(false);
    expect(SealsSchema.safeParse(repeat(seal, 4)).success).toBe(false);
  });

  it("requires exactly 2 headline metrics", () => {
    expect(MetricsSchema.safeParse(repeat(metric, 2)).success).toBe(true);
    expect(MetricsSchema.safeParse(repeat(metric, 1)).success).toBe(false);
    expect(MetricsSchema.safeParse(repeat(metric, 3)).success).toBe(false);
  });
});

describe("minimum cardinalities required by 2.5", () => {
  it("rejects an empty update list", () => {
    expect(UpdatesSchema.safeParse([]).success).toBe(false);
    expect(UpdatesSchema.safeParse([update]).success).toBe(true);
  });

  it("rejects an empty FAQ list", () => {
    expect(FaqListSchema.safeParse([]).success).toBe(false);
    expect(FaqListSchema.safeParse([faqEntry]).success).toBe(true);
  });
});

describe("UpdateSchema", () => {
  // 2.6 — the stored date is ISO YYYY-MM; the displayed text is derived from it.
  it("accepts a well-formed ISO month", () => {
    expect(UpdateSchema.safeParse({ ...update, date: "2026-01" }).success).toBe(true);
    expect(UpdateSchema.safeParse({ ...update, date: "2026-12" }).success).toBe(true);
  });

  it("rejects a date outside the ISO YYYY-MM shape", () => {
    for (const date of ["2026-13", "2026-00", "julio 2026", "2026-7", "2026-07-01", "26-07", ""]) {
      expect(UpdateSchema.safeParse({ ...update, date }).success).toBe(false);
    }
  });

  // 3.4-style guard: the displayed label is never declared in the content file.
  it("rejects an update that declares its own displayed label", () => {
    expect(UpdateSchema.safeParse({ ...update, label: "JULIO 2026" }).success).toBe(false);
  });
});

describe("FaqSchema", () => {
  // 5.3 — a question without a statement or without an answer is rejected.
  it("rejects an entry missing its question or its answer", () => {
    expect(FaqSchema.safeParse({ answer: "Respuesta" }).success).toBe(false);
    expect(FaqSchema.safeParse({ question: "¿Pregunta?" }).success).toBe(false);
    expect(FaqSchema.safeParse({ question: "¿Pregunta?", answer: "  " }).success).toBe(false);
    expect(FaqSchema.safeParse({ question: "  ", answer: "Respuesta" }).success).toBe(false);
  });
});

describe("blank text rejected everywhere by 2.8", () => {
  it("rejects whitespace-only fields in every content schema", () => {
    expect(AudienceSchema.safeParse(repeat({ ...profile, title: " " }, 4)).success).toBe(false);
    expect(AudienceSchema.safeParse(repeat({ ...profile, icon: "" }, 4)).success).toBe(false);
    expect(MethodologySchema.safeParse(repeat({ ...methodBlock, description: "  " }, 2)).success).toBe(
      false,
    );
    expect(SealsSchema.safeParse(repeat({ ...seal, name: " " }, 3)).success).toBe(false);
    expect(MetricsSchema.safeParse(repeat({ ...metric, value: " " }, 2)).success).toBe(false);
    expect(UpdatesSchema.safeParse([{ ...update, title: " " }]).success).toBe(false);
    expect(SiteSchema.safeParse({ ...site, name: "  " }).success).toBe(false);
    expect(
      SiteSchema.safeParse({ ...site, hero: { ...site.hero, headline: " " } }).success,
    ).toBe(false);
    expect(FooterSchema.safeParse({ ...footer, legal: " " }).success).toBe(false);
  });
});

describe("SiteSchema", () => {
  it("accepts the site fixture", () => {
    expect(SiteSchema.safeParse(site).success).toBe(true);
  });

  it("rejects a canonical address that is not a URL", () => {
    expect(SiteSchema.safeParse({ ...site, canonicalUrl: "cryptocrime.academy" }).success).toBe(
      false,
    );
  });

  it("rejects an unknown field", () => {
    expect(SiteSchema.safeParse({ ...site, analytics: "on" }).success).toBe(false);
  });
});

describe("NavSchema and FooterSchema", () => {
  it("accepts anchors pointing at existing sections", () => {
    expect(
      NavSchema.safeParse([
        { label: "Audiencia", href: "#audiencia" },
        { label: "Programa", href: "#programa" },
      ]).success,
    ).toBe(true);
    expect(FooterSchema.safeParse(footer).success).toBe(true);
  });

  // 1.5, defence in depth: the type already forbids it, the schema confirms it.
  it("rejects an anchor without a destination section", () => {
    expect(NavSchema.safeParse([{ label: "Testimonios", href: "#testimonios" }]).success).toBe(
      false,
    );
    expect(
      FooterSchema.safeParse({
        ...footer,
        links: [{ label: "Testimonios", href: "#testimonios" }],
      }).success,
    ).toBe(false);
  });

  it("rejects an empty navigation list", () => {
    expect(NavSchema.safeParse([]).success).toBe(false);
  });

  it("requires the newsletter destination to be a URL", () => {
    expect(
      FooterSchema.safeParse({ ...footer, newsletter: { label: "Suscribirse", href: "boletin" } })
        .success,
    ).toBe(false);
  });
});

describe("SocialProofSchema", () => {
  it("carries exactly 3 seals and 2 metrics", () => {
    expect(SocialProofSchema.safeParse(socialProof).success).toBe(true);
    expect(
      SocialProofSchema.safeParse({ ...socialProof, seals: repeat(seal, 2) }).success,
    ).toBe(false);
    expect(
      SocialProofSchema.safeParse({ ...socialProof, metrics: repeat(metric, 3) }).success,
    ).toBe(false);
  });
});
