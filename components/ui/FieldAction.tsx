import type { ReactNode } from "react";

import styles from "./FieldAction.module.css";

interface FieldActionProps {
  href: string;
  children: ReactNode;
}

/**
 * The small link that sits beside a field label — «olvidé mi contraseña» on the
 * access screen, «reenviar código» on the verification step.
 *
 * It is a component rather than a class because it is an action control, and
 * the 44px target of 7.6 is the kind of thing that gets forgotten the second
 * time it is written by hand.
 */
export function FieldAction({ href, children }: FieldActionProps) {
  return (
    <a className={styles.action} href={href}>
      {children}
    </a>
  );
}
