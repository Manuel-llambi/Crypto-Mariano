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

/** Step 1 of the sign-up flow, and the target of every enrolment control. */
export const SIGNUP_HREF = "/registro?intent=signup";

/** Step 2 — the verification code. */
export const SIGNUP_CODE_HREF = "/registro/codigo";

/** Step 3 — the new account. */
export const SIGNUP_ACCOUNT_HREF = "/registro/crear-cuenta";

/**
 * The student dashboard, where signing in lands.
 *
 * Still a mock: nothing guards it, because nothing authenticates. It is reached
 * from the control of `/acceso` and by typing the address, and those are the
 * same thing until there is a session to check.
 */
export const PANEL_HREF = "/panel";
