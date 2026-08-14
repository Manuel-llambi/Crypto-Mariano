/**
 * Copy for the access screens.
 *
 * Versioned and validated like every other string of the project: a screen is
 * not an exception to 2.2 and 2.3.
 *
 * `login` addresses the visitor as «usted», which is how the mockup wrote it.
 * Everything under `signup` is tuteo, the register closed on 2026-08-13.
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
    protocol: "Protocolo de acceso: AUTH-2024",
  },

  signup: {
    /** Step 1 — the e-mail that will receive the code. */
    email: {
      title: "Verifica tu correo",
      subtitle: "Ingresa tu email institucional y te enviamos un código de verificación",
      emailLabel: "Email institucional",
      submitLabel: "Enviar código",
      protocol: "Protocolo de alta: AUTH-2024 · Paso 1 de 3",
    },

    /** Step 2 — the code that arrived by e-mail. */
    code: {
      title: "Ingresa el código",
      subtitle: "Enviamos un código de verificación a tu email institucional",
      codeLabel: "Código de verificación",
      resendLabel: "Reenviar código",
      submitLabel: "Verificar",
      protocol: "Protocolo de alta: AUTH-2024 · Paso 2 de 3",
    },

    /** Step 3 — the account itself. */
    account: {
      title: "Crea tu cuenta",
      subtitle: "Define la contraseña con la que vas a entrar a tu terminal de investigación",
      emailLabel: "Email institucional",
      passwordLabel: "Contraseña",
      submitLabel: "Crear cuenta",
      protocol: "Protocolo de alta: AUTH-2024 · Paso 3 de 3",
    },
  },
};
