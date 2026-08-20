/**
 * Copy for the access screens.
 *
 * Versioned and validated like every other string of the project: a screen is
 * not an exception to 2.2 and 2.3.
 *
 * `login.subtitle` addresses the visitor as «usted», which is how the mockup
 * wrote it, and it stays that way: rewriting it is a copy decision the login
 * spec of 2026-08-17 deliberately left alone. The new string here —
 * `login.errorMessage` — and everything under `signup` are tuteo, the register
 * closed on 2026-08-13. The two registers do sit a few centimetres apart on the
 * same card; that debt is recorded, not resolved.
 * Addresses are not here: they are routes, and they live in `lib/routes.ts`.
 */
export const access = {
  login: {
    title: "Iniciar sesión",
    subtitle: "Acceda a su terminal de investigación institucional",
    emailLabel: "Email institucional",
    passwordLabel: "Contraseña",
    forgotLabel: "Olvidé mi contraseña",
    forgotHref: "/recuperar-acceso",
    submitLabel: "Acceder al sistema",
    /**
     * Tuteo, the register the project closed on 2026-08-13 for new copy.
     *
     * It says nothing about which half failed: the same text covers a wrong
     * password and an address that was never registered (2.2).
     */
    errorMessage: "No pudimos verificar tus credenciales. Revisa el correo y la contraseña.",
    protocol: "Protocolo de acceso: AUTH-2024",
  },

  signup: {
    /** Step 1 — the e-mail that will receive the code. */
    email: {
      title: "Verifica tu correo",
      subtitle: "Ingresa tu email institucional y te enviamos un código de verificación",
      emailLabel: "Email institucional",
      submitLabel: "Enviar código",
      /**
       * Every refusal of step 1, in one sentence (1.2, 1.4).
       *
       * It names no cause because it cannot: the same text covers an address
       * that is empty, one that is malformed, an instance that did not answer,
       * and an address that already has an account. That last one is the reason
       * this is one message and not four — saying so would tell whoever typed it
       * which addresses are registered (1.3).
       */
      errorMessage:
        "No pudimos enviar el código. Revisa tu email institucional e inténtalo de nuevo.",
      /**
       * For someone who did nothing wrong (4.3).
       *
       * They got to step 2 with no pending address — the code expired, or the
       * cookie did — so the message tells them the one thing that fixes it
       * rather than suggesting they made a mistake.
       */
      expiredMessage: "Tu solicitud caducó. Pide un código nuevo con tu email institucional.",
      protocol: "Protocolo de alta: AUTH-2024 · Paso 1 de 3",
    },

    /** Step 2 — the code that arrived by e-mail. */
    code: {
      title: "Ingresa el código",
      subtitle: "Enviamos un código de verificación a tu email institucional",
      codeLabel: "Código de verificación",
      resendLabel: "Reenviar código",
      submitLabel: "Verificar",
      /**
       * The three ways a code fails, said the same way (2.2).
       *
       * Wrong, expired and already used are one message, and it points at the
       * way out the screen already offers: asking for another one.
       */
      errorMessage: "El código no es válido o ya caducó. Revísalo o pide uno nuevo.",
      protocol: "Protocolo de alta: AUTH-2024 · Paso 2 de 3",
    },

    /** Step 3 — the account itself. */
    account: {
      title: "Crea tu cuenta",
      subtitle: "Define la contraseña con la que vas a entrar a tu terminal de investigación",
      emailLabel: "Email institucional",
      passwordLabel: "Contraseña",
      submitLabel: "Crear cuenta",
      /**
       * Two messages, unlike the two steps before (3.2).
       *
       * Whoever gets here has already proved the mailbox is theirs, so there is
       * nothing left to hide and a vague message would only leave them guessing
       * what to change. `weak` says the rule without restating it — the length
       * lives in `supabase/config.toml` and a number copied here would go stale
       * the day it changes (3.3).
       */
      errorMessages: {
        weak: "Esa contraseña es demasiado débil. Elige una más larga y menos previsible.",
        generic: "No pudimos guardar tu contraseña. Inténtalo de nuevo.",
      },
      protocol: "Protocolo de alta: AUTH-2024 · Paso 3 de 3",
    },
  },
};
