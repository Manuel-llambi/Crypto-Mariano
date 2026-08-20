import { cookies } from "next/headers";

/**
 * The name of the cookie, spelled once.
 *
 * Two Server Actions and one page guard read or write it, and a name typed in
 * four places is a name that eventually disagrees with itself.
 */
export const PENDING_EMAIL_COOKIE = "registro_correo";

/**
 * How long the address is worth holding on to.
 *
 * Copied from `auth.email.otp_expiry` in `supabase/config.toml`, which is where
 * the real number lives. There is no way to read that TOML from here, so this
 * is a copy with a comment rather than a lookup — and the address has no
 * business outliving the code it belongs to.
 */
const MAX_AGE_SECONDS = 3600;

/**
 * Where the cookie is sent, and the trap of this whole module.
 *
 * Scoped to the sign-up flow, so it never travels to the landing, the dashboard
 * or the access screen. The catch is that a browser only discards a cookie when
 * the deletion carries the *same* path it was written with — so this constant
 * is shared by the write and the delete rather than typed twice (4.2).
 */
const PATH = "/registro";

/**
 * The attributes every write uses.
 *
 * The same shape `lib/supabase/server.ts` imposes on the session cookies:
 * `httpOnly` because nothing in the browser reads this — both consumers are
 * Server Actions (4.1) — and `secure` everywhere but development, where there
 * is no HTTPS to be had.
 */
const ATTRIBUTES = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV !== "development",
  path: PATH,
} as const;

/**
 * Holds the address while the visitor goes to read their mailbox (4.1).
 *
 * It rides in a cookie rather than in the URL because the address bar ends up
 * in browser history, in server logs and in the referrer of the next request.
 * An e-mail is not a password, but there is no reason to hand it over.
 */
export async function setPendingEmail(email: string): Promise<void> {
  const store = await cookies();

  store.set(PENDING_EMAIL_COOKIE, email, { ...ATTRIBUTES, maxAge: MAX_AGE_SECONDS });
}

/**
 * The address being verified, or `undefined` when there is none (4.3).
 *
 * That `undefined` is the whole question the guard of `/registro/codigo` asks
 * before it emits any markup.
 */
export async function readPendingEmail(): Promise<string | undefined> {
  const store = await cookies();

  return store.get(PENDING_EMAIL_COOKIE)?.value;
}

/**
 * Discards it, which is what verifying the code makes possible (4.2).
 *
 * Written empty with `maxAge: 0` rather than deleted by name: the expiry is
 * what tells the browser to drop it, and `ATTRIBUTES` is what makes the path
 * match the one it was written with.
 */
export async function clearPendingEmail(): Promise<void> {
  const store = await cookies();

  store.set(PENDING_EMAIL_COOKIE, "", { ...ATTRIBUTES, maxAge: 0 });
}
