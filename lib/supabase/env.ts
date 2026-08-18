import { z } from "zod";

/**
 * The two settings the Supabase clients need, validated at import time (6.1).
 *
 * Both are public: the address of the local instance and its publishable key,
 * which is the one meant to travel to a browser. No privileged credential is
 * read here, and none belongs in this repository (6.3).
 *
 * They carry no `NEXT_PUBLIC_` prefix on purpose. Nothing in the browser reads
 * them — every consumer runs on the server — and the prefix would only inline
 * them into the client bundle.
 */
const EnvSchema = z.strictObject({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

/**
 * Parsing a literal object rather than `process.env` itself: the environment
 * carries hundreds of unrelated keys, and `z.strictObject` would reject every
 * one of them. The two static member accesses are also what lets Next replace
 * the literals at build time.
 */
const parsed = EnvSchema.safeParse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
});

if (!parsed.success) {
  // Naming only the settings that actually failed is the point: it separates
  // "which of the two" from a generic "configuration is missing".
  const detail = parsed.error.issues
    .map((issue) => `  - ${String(issue.path[0] ?? "(unknown)")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid Supabase configuration:\n${detail}`);
}

export const supabaseEnv: { url: string; publishableKey: string } = {
  url: parsed.data.SUPABASE_URL,
  publishableKey: parsed.data.SUPABASE_PUBLISHABLE_KEY,
};
