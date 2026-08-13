import type { z } from "zod";

/** Dotted path to a value, or a marker when the whole file is the problem. */
function pathOf(path: PropertyKey[]): string {
  return path.length > 0 ? path.join(".") : "(root)";
}

/**
 * One line of "field: reason" per rejection (2.3).
 *
 * Surplus keys are described by hand because Zod reports them with an empty
 * path and the bare message "Invalid input", which names neither the field nor
 * what is wrong with it. Prefixing the path matters inside arrays: without it,
 * three bad entries produce three identical lines and none says which entry.
 */
function describe(issue: z.core.$ZodIssue): string[] {
  if (issue.code === "unrecognized_keys") {
    const prefix = issue.path.length > 0 ? `${issue.path.join(".")}.` : "";
    return issue.keys.map(
      (key) => `${prefix}${key}: unrecognized field — this file must not declare it`,
    );
  }

  return [`${pathOf(issue.path)}: ${issue.message}`];
}

/**
 * Parses one content file, or throws naming file, field and reason (2.3).
 *
 * Every content file goes through here, so an editing mistake surfaces as a
 * build failure that says where to look instead of as a blank spot on the page.
 */
export function parseContent<Schema extends z.ZodType>(
  file: string,
  schema: Schema,
  data: unknown,
): z.infer<Schema> {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  const detail = result.error.issues
    .flatMap(describe)
    .map((line) => `  - ${line}`)
    .join("\n");

  throw new Error(`Invalid content in ${file}:\n${detail}`);
}
