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

/**
 * The lesson viewer, below the dashboard so it inherits the same guard.
 *
 * The codes travel lowercased because an address is not a label: `EXP-00` reads
 * as a file number on screen and `/panel/modulo/exp-00/lec-01` reads as a path.
 * The screen uppercases them again to print them, and matches case-insensitively
 * on the way in, so a link typed either way lands on the same lesson.
 */
export const LESSON_BASE = "/panel/modulo";

export function lessonHref(moduleCode: string, lessonCode: string): string {
  return `${LESSON_BASE}/${moduleCode.toLowerCase()}/${lessonCode.toLowerCase()}`;
}

/**
 * The two views of the lesson's right rail.
 *
 * A query parameter and not a client component: switching the rail is a
 * navigation, so the tabs are anchors and the screen keeps working with no
 * script at all (8.1). The cost is a page load per switch, which on a server
 * component reading versioned content is nothing.
 *
 * The names live here rather than beside the tabs for the reason every other
 * address in this file does: the page reads the parameter and the rail writes
 * the links, and a value spelled in two places eventually disagrees with
 * itself.
 */
export const LESSON_VIEW_PARAM = "vista";

export const LESSON_VIEWS = { content: "contenido", resources: "recursos" } as const;

export type LessonView = (typeof LESSON_VIEWS)[keyof typeof LESSON_VIEWS];

/**
 * Reads the parameter, falling back to the content view.
 *
 * Anything unrecognised is the content view too, and deliberately: a hand-typed
 * `?vista=cualquiera` should show the lesson, not an error page. The parameter
 * selects a rail, it does not identify a resource.
 */
export function lessonView(raw: string | string[] | undefined): LessonView {
  return raw === LESSON_VIEWS.resources ? LESSON_VIEWS.resources : LESSON_VIEWS.content;
}

/** The address of one view of one lesson. */
export function lessonViewHref(
  moduleCode: string,
  lessonCode: string,
  view: LessonView,
): string {
  const base = lessonHref(moduleCode, lessonCode);

  // The content view is the default, so it needs no parameter to select it.
  return view === LESSON_VIEWS.content ? base : `${base}?${LESSON_VIEW_PARAM}=${view}`;
}

/**
 * Where a refused first step lands (1.2, 1.4).
 *
 * Derived from `SIGNUP_HREF` rather than spelled out, so the address cannot end
 * up written two ways. The `&` and not a `?` because `SIGNUP_HREF` already
 * carries `?intent=signup`.
 *
 * It carries no e-mail. That is the point of 1.5: the address bar reaches
 * browser history, server logs and the referrer of the next request, and the
 * address travels in an `httpOnly` cookie instead.
 */
export const SIGNUP_ERROR_CODE = "correo";

export const SIGNUP_ERROR_HREF = `${SIGNUP_HREF}&error=${SIGNUP_ERROR_CODE}`;

/**
 * The pending address expired, or was never there (4.3).
 *
 * It lands on step 1 rather than step 2 because asking for a code again is
 * exactly what the visitor has to do, and step 1 is the screen that knows how.
 * A separate marker from `SIGNUP_ERROR_CODE` so the screen can say the two
 * different things they are: one is a refusal, this one is not.
 */
export const SIGNUP_EXPIRED_CODE = "vencido";

export const SIGNUP_EXPIRED_HREF = `${SIGNUP_HREF}&error=${SIGNUP_EXPIRED_CODE}`;

/**
 * Where a refused code lands (2.2).
 *
 * A `?` and not an `&` here, because `SIGNUP_CODE_HREF` carries no parameters
 * of its own — step 2 is not an entry point of the flow, so it states no intent.
 *
 * One marker for wrong, expired and already used: telling them apart would say
 * more about the code than the visitor is entitled to know, and it carries
 * neither the code nor the address (2.5).
 */
export const SIGNUP_CODE_ERROR_CODE = "codigo";

export const SIGNUP_CODE_ERROR_HREF = `${SIGNUP_CODE_HREF}?error=${SIGNUP_CODE_ERROR_CODE}`;

/**
 * The two reasons step 3 can give (3.2).
 *
 * Unlike steps 1 and 2, this screen names the cause. Whoever gets here has
 * already proved the mailbox is theirs, so there is nothing left to hide, and a
 * vague message would only leave them guessing what to change.
 *
 * `weak` is the instance's password policy talking — Supabase answers 422 with
 * `weak_password`, verified against it. `error` is everything else, including a
 * password that never got asked about.
 */
export const SIGNUP_ACCOUNT_ERROR_CODES = { weak: "debil", generic: "error" } as const;

export const SIGNUP_ACCOUNT_WEAK_HREF = `${SIGNUP_ACCOUNT_HREF}?error=${SIGNUP_ACCOUNT_ERROR_CODES.weak}`;

export const SIGNUP_ACCOUNT_ERROR_HREF = `${SIGNUP_ACCOUNT_HREF}?error=${SIGNUP_ACCOUNT_ERROR_CODES.generic}`;
