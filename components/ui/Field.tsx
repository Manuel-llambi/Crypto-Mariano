import type { ReactNode } from "react";

import styles from "./Field.module.css";

interface FieldProps {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  name: string;
  autoComplete?: string;
  /** Which keyboard a phone should offer — a code is digits, not prose. */
  inputMode?: "numeric" | "text";
  /** Optional control beside the label, such as «forgot my password». */
  action?: ReactNode;
}

/**
 * A labelled input.
 *
 * The label is a real `<label for>` pointing at the input's `id`, not a
 * placeholder standing in for one: a placeholder disappears the moment someone
 * types, and is never announced as the field's name.
 */
export function Field({ id, label, type, name, autoComplete, inputMode, action }: FieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.head}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {action}
      </div>

      <input
        className={styles.input}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
      />
    </div>
  );
}
