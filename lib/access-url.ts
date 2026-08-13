import { z } from "zod";

/** Which flow the access screen should open (6.1, 6.2). */
export type AccessIntent = "login" | "signup";

/**
 * The access screen lives outside this landing; only its address is our concern.
 *
 * The literal `process.env.NEXT_PUBLIC_ACCESS_URL` is what Next replaces at
 * build time, so it must stay a static member access — destructuring or a
 * dynamic key would leave it undefined in the browser bundle.
 */
const configured = z.url().safeParse(process.env.NEXT_PUBLIC_ACCESS_URL);

if (!configured.success) {
  throw new Error(
    "NEXT_PUBLIC_ACCESS_URL must be set to a valid URL: it is the address of the access screen. " +
      `Received: ${JSON.stringify(process.env.NEXT_PUBLIC_ACCESS_URL)}`,
  );
}

const base = configured.data;

/**
 * The outbound link to the access screen, carrying the intent (6.1, 6.2).
 *
 * This builds a string and nothing else. No credentials, no code delivery, no
 * session, no payment — authentication is out of scope for this landing (6.7).
 */
export function accessUrl(intent: AccessIntent): string {
  const url = new URL(base);
  url.searchParams.set("intent", intent);
  return url.toString();
}
