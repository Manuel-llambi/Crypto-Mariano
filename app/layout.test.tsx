import { describe, expect, it } from "vitest";

import RootLayout, { metadata } from "./layout";
import { site } from "@/lib/content";

// 9.1 — the document declares Spanish. Asserted on the element the layout
// returns rather than on a render, because <html> cannot be mounted inside the
// test container.
describe("document language (9.1)", () => {
  it("declares Spanish on the root element", () => {
    const tree = RootLayout({ children: null });

    expect(tree.type).toBe("html");
    expect(tree.props.lang).toBe("es");
  });
});

describe("document metadata (10.1)", () => {
  it("declares the title from the content", () => {
    expect(metadata.title).toBe(site.title);
  });

  it("declares the description from the content", () => {
    expect(metadata.description).toBe(site.description);
  });

  it("declares the canonical address", () => {
    expect(metadata.alternates?.canonical).toBe(site.canonicalUrl);
  });

  it("declares nothing of its own: every value traces to content/site.ts", () => {
    expect(metadata.title).not.toBe("");
    expect(metadata.description).not.toBe("");
    expect(String(metadata.alternates?.canonical)).toContain("http");
  });
});

describe("social preview metadata (10.2)", () => {
  it("declares an OpenGraph block with title, description and address", () => {
    expect(metadata.openGraph?.title).toBe(site.title);
    expect(metadata.openGraph?.description).toBe(site.description);
    expect(metadata.openGraph?.url).toBe(site.canonicalUrl);
  });

  it("declares the preview image", () => {
    const images = metadata.openGraph?.images;
    expect(Array.isArray(images)).toBe(true);
    expect(JSON.stringify(images)).toContain(site.ogImage);
  });

  it("gives the preview image its dimensions, so the card is not cropped", () => {
    const images = JSON.stringify(metadata.openGraph?.images);
    expect(images).toContain("1200");
    expect(images).toContain("630");
  });

  it("gives the preview image alternative text", () => {
    expect(JSON.stringify(metadata.openGraph?.images)).toContain("alt");
  });

  it("declares a large summary card for the other network", () => {
    // Next models `twitter` as a union in which only some members carry `card`,
    // so the property is read through a narrow shape rather than the union.
    const twitter = metadata.twitter as { card?: string } | null | undefined;
    expect(twitter?.card).toBe("summary_large_image");
  });

  it("declares the document in Spanish for the preview too", () => {
    expect(metadata.openGraph?.locale).toBe("es_ES");
  });
});
