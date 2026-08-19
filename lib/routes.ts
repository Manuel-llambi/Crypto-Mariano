/**
 * The internal addresses of the transactional screens.
 *
 * They live here rather than beside each control because several places point
 * at the same screen — the three enrolment controls, and the «resend code» link
 * that sends someone back to the first step — and a path spelled twice is a
 * path that eventually disagrees with itself.
 *
 * The intent is kept on the two entry points even though the route already
 * identifies the flow: 6.1 and 6.2 ask the destination to state it.
 */
export const LOGIN_HREF = "/acceso?intent=login";

/**
 * Where a rejected sign-in lands (2.3).
 *
 * Derived from `LOGIN_HREF` rather than spelled out, so the two server-side
 * redirections to this screen — the guard of the dashboard and this one — can
 * never end up as two different spellings of the same address. It carries the
 * intent for the same reason the entry points do: the destination states which
 * flow it belongs to.
 *
 * It carries no e-mail and no password. That is the point: a password in the
 * query string reaches browser history, server logs and the referrer of the
 * next request.
 */
export const LOGIN_ERROR_CODE = "credenciales";

export const LOGIN_ERROR_HREF = `${LOGIN_HREF}&error=${LOGIN_ERROR_CODE}`;

/** Step 1 of the sign-up flow, and the target of every enrolment control. */
export const SIGNUP_HREF = "/registro?intent=signup";

/** Step 2 — the verification code. */
export const SIGNUP_CODE_HREF = "/registro/codigo";

/** Step 3 — the new account. */
export const SIGNUP_ACCOUNT_HREF = "/registro/crear-cuenta";

/**
 * The student dashboard, where signing in lands.
 *
 * Guarded since the login spec of 2026-08-17: its shared chrome checks the
 * session against the authentication server before it emits any content, so
 * typing the address no longer opens it.
 */
export const PANEL_HREF = "/panel";
