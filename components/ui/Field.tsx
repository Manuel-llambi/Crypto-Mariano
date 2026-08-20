import type { ReactNode } from "react";

import styles from "./Field.module.css";

interface FieldProps {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  /**
   * The key the value is submitted under — and, when absent, the reason it is
   * not submitted at all (3.5).
   *
   * A control with no `name` is left out of the submission by the browser
   * itself. That is what the read-only echo of `/registro/crear-cuenta` relies
   * on: the account being written to is the one the session identifies, and a
   * posted address has no way in.
   *
   * The cost of making it optional is that a field which *does* have to be sent
   * no longer fails to compile when its `name` is forgotten — it just quietly
   * stops being serialised. Every caller that submits keeps its own, and the
   * screen tests are what say so.
   */
  name?: string;
  /**
   * Shown but not editable, for a value the visitor cannot change here.
   *
   * `readOnly` and never `disabled`: a disabled control is skipped by keyboard
   * navigation and often goes unannounced by a screen reader, which would
   * defeat the point of showing it.
   */
  readOnly?: boolean;
  /**
   * What the field starts with.
   *
   * It arrives as `defaultValue`, not `value`: a `value` with no `onChange`
   * makes the input controlled and React warns about it — and these are server
   * components, with nowhere to put a handler.
   */
  value?: string;
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
export function Field({
  id,
  label,
  type,
  name,
  readOnly,
  value,
  autoComplete,
  inputMode,
  action,
}: FieldProps) {
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
        readOnly={readOnly}
        defaultValue={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
      />
    </div>
  );
}
