import { Badge } from "@/components/ui/Badge";
import { Disclosure } from "@/components/ui/Disclosure";
import type { SectionId } from "@/lib/nav/sections";
import { SIGNUP_HREF } from "@/lib/routes";
import type { DerivedModule, DerivedProgram } from "@/lib/program/derive";

import styles from "./ProgramSection.module.css";

interface ProgramSectionProps {
  program: DerivedProgram;
  /** The shared enrolment wording, so 6.6 holds across the three controls. */
  enrollLabel: string;
}

const SECTION: SectionId = "programa";

/** The second of the three enrolment controls, after the header. */
const ENROL_HREF = SIGNUP_HREF;

/** Code and title, the part both branches share. */
function ModuleHeading({ module }: { module: DerivedModule }) {
  return (
    <span className={styles.heading}>
      <span className={styles.code} data-testid="module-code">
        {module.code}
      </span>
      <span className={styles.title} data-testid="module-title">
        {module.title}
      </span>
    </span>
  );
}

/**
 * The syllabus: the only place on the page with two branches of presentation.
 *
 * The branch is chosen on `status`, which the discriminated union makes
 * exhaustive — a third state would stop compiling here (4.1).
 */
function Module({ module }: { module: DerivedModule }) {
  if (module.status === "coming-soon") {
    // 4.2 — label and teaser are permanent, and there is no control at all.
    return (
      <article className={styles.module}>
        <div className={styles.moduleHead}>
          <ModuleHeading module={module} />
          <Badge>Próximamente</Badge>
        </div>
        <p className={styles.teaser}>{module.teaser}</p>
      </article>
    );
  }

  // 4.3 with a summary, 4.4 without one: Disclosure already drops the control
  // when it gets no content, so there is no second branch to write here.
  return (
    <Disclosure className={styles.module} summary={<ModuleHeading module={module} />}>
      {module.summary}
    </Disclosure>
  );
}

export function ProgramSection({ program, enrollLabel }: ProgramSectionProps) {
  return (
    <section id={SECTION} className={styles.section}>
      <Badge className={styles.eyebrow}>Programa</Badge>

      <h2 className={styles.sectionTitle}>Investigaciones con criptomonedas</h2>

      <dl className={styles.figures}>
        {/* 3.5 — with no available module there is no duration to announce, and
            the figure is omitted rather than shown as zero. */}
        {program.durationLabel !== null && (
          <div data-testid="duration">
            <dt>Duración</dt>
            <dd>{program.durationLabel} de video en los módulos disponibles</dd>
          </div>
        )}
        <div data-testid="module-count">
          <dt>Temario</dt>
          <dd>
            {program.moduleCount} {program.moduleCount === 1 ? "módulo" : "módulos"}
          </dd>
        </div>
      </dl>

      <p className={styles.description}>{program.description}</p>

      {/* A plain anchor: no handler, no script navigation (6.3). */}
      <a className={styles.cta} href={ENROL_HREF}>
        {enrollLabel}
      </a>

      {/* 4.8 — declaration order, straight through. */}
      <div className={styles.modules}>
        {program.modules.map((module) => (
          <Module key={module.code} module={module} />
        ))}
      </div>
    </section>
  );
}
