import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { parseContent } from "./parse";
import { SECTION_IDS } from "@/lib/nav/sections";

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("parseContent", () => {
  const schema = z.strictObject({ title: z.string().min(1) });

  // 2.3 — the message has to name the file, the field and the reason.
  it("names file, field and reason when a value is rejected", () => {
    let message = "";
    try {
      parseContent("content/site.ts", schema, { title: "" });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain("content/site.ts");
    expect(message).toContain("title");
    expect(message.length).toBeGreaterThan("content/site.ts".length + "title".length);
  });

  it("names the field of a surplus key", () => {
    let message = "";
    try {
      parseContent("content/site.ts", schema, { title: "Título", analytics: "on" });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain("analytics");
  });

  // Discovered in T18: three bad entries produced three identical lines, none
  // of which said which entry was at fault.
  it("locates a surplus key inside an array", () => {
    const list = z.array(z.strictObject({ title: z.string() }));
    let message = "";
    try {
      parseContent("content/faq.ts", list, [{ title: "Uno" }, { title: "Dos", extra: 1 }]);
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain("1.extra");
  });

  it("says what is wrong with a surplus key, not just its name", () => {
    let message = "";
    try {
      parseContent("content/site.ts", schema, { title: "Título", analytics: "on" });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain("unrecognized field");
  });

  it("names the field of a missing key", () => {
    let message = "";
    try {
      parseContent("content/site.ts", schema, {});
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain("title");
  });

  it("returns the parsed value when it satisfies the schema", () => {
    expect(parseContent("content/site.ts", schema, { title: "Título" })).toEqual({
      title: "Título",
    });
  });
});

describe("the content index", () => {
  // 2.2 — importing the module is what runs the validation; the real content of
  // the repository has to pass it.
  it("imports the real content without throwing", async () => {
    await expect(import("./index")).resolves.toBeDefined();
  });

  // 2.1 — every value comes from a static import, so nothing reaches the network.
  it("makes no network request while loading", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("the content module must not reach the network");
    });

    vi.resetModules();
    await import("./index");

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("exposes every section of content", async () => {
    const content = await import("./index");

    expect(content.audience).toHaveLength(4);
    expect(content.methodology).toHaveLength(2);
    expect(content.socialProof.seals).toHaveLength(3);
    expect(content.socialProof.metrics).toHaveLength(2);
    expect(content.faq.length).toBeGreaterThan(0);
    expect(content.nav.length).toBeGreaterThan(0);
    expect(content.site.name.length).toBeGreaterThan(0);
  });

  // 2.7 — descending by date, whatever order the file happens to declare.
  it("exposes the updates from the most recent to the oldest", async () => {
    const { updates } = await import("./index");
    const dates = updates.map((update) => update.date);

    expect(dates).toEqual([...dates].sort().reverse());
    expect(dates.length).toBeGreaterThan(1);
  });

  it("does not lose or duplicate an update while sorting", async () => {
    const { updates } = await import("./index");
    const raw = (await import("@/content/updates")).updates;

    expect(updates).toHaveLength(raw.length);
    expect([...updates].map((u) => u.date).sort()).toEqual(raw.map((u) => u.date).sort());
  });

  // 3.1, 3.2 — the program arrives already derived; nothing else derives it.
  it("exposes the program already derived", async () => {
    const { program } = await import("./index");

    expect(program.moduleCount).toBe(program.modules.length);
    expect(program.modules.map((module) => module.code)).toEqual(
      program.modules.map((_, index) => `EXP-${String(index).padStart(2, "0")}`),
    );
    expect(program.durationLabel).not.toBeNull();
  });

  // 1.5 — every navigation anchor has a section to land on.
  it("only navigates to declared sections", async () => {
    const { nav, footer } = await import("./index");
    const anchors = SECTION_IDS.map((id) => `#${id}`);

    for (const item of [...nav, ...footer.links]) {
      expect(anchors).toContain(item.href);
    }
  });
});
