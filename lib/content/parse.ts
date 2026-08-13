import type { z } from "zod";

/** Names the offending field, or the root when the whole value is wrong. */
function fieldOf(issue: z.core.$ZodIssue): string {
  if (issue.code === "unrecognized_keys") {
    return issue.keys.join(", ");
  }
  return issue.path.length > 0 ? issue.path.join(".") : "(root)";
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
    .map((issue) => `  - ${fieldOf(issue)}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid content in ${file}:\n${detail}`);
}
