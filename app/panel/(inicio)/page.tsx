import type { Metadata } from "next";

import { ContinueCard } from "@/components/sections/ContinueCard";
import { ModuleGrid } from "@/components/sections/ModuleGrid";
import { ProgressCard } from "@/components/sections/ProgressCard";
import { PanelIcon } from "@/components/ui/PanelIcon";
import { lesson, panel, program, site } from "@/lib/content";
import { currentLessonHref, deriveOutline } from "@/lib/lesson/outline";
import { derivePanel } from "@/lib/panel/derive";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${panel.title} — ${site.name}`,
};

/**
 * The student dashboard (UI only).
 *
 * It shows the same seven modules as the landing, read from the same syllabus,
 * with the student's position in them laid over the top. Everything visible
 * here about that position — which module is passed, which is locked, what
 * unlocks it — is derived from a single index declared in `content/panel.ts`.
 *
 * The route is guarded, and not here: the check lives in the shared chrome of
 * `app/panel/layout.tsx`, so every screen added below `/panel` inherits it.
 * This one only draws. What it draws is still versioned content — the session
 * says who may look, not what is shown.
 */
export default function PanelPage() {
  const { record } = panel;
  const derived = derivePanel(program.modules, record);

  /*
   * Where the card opens, read back through the viewer's own tree.
   *
   * Two content files describe the same student — `panel.record` names the
   * module, `lesson.record` names the lesson — and nothing forces them to
   * agree. Passing the module code in makes `currentLessonHref` answer only
   * when they do, so the card can never name one module and open another.
   */
  const outline = deriveOutline(program.modules, lesson.moduleLessons, lesson.record);
  const continueHref = currentLessonHref(outline, derived.current.code);

  return (
    <div className={styles.page}>
      <header className={styles.welcome}>
        <p className={styles.eyebrow}>{panel.welcome.eyebrow}</p>
        <h1 className={styles.greeting}>
          {panel.welcome.greeting} {panel.student.name}
        </h1>
        <p className={styles.body}>
          {derived.started ? panel.welcome.body : panel.welcome.startBody}
        </p>
      </header>

      <hr className={styles.rule} />

      <div className={styles.top}>
        <ContinueCard
          copy={panel.continueCard}
          module={derived.current}
          estimatedMinutes={record.estimatedMinutes}
          attachmentCount={record.attachmentCount}
          started={derived.started}
          href={continueHref}
        />
        <ProgressCard
          copy={panel.progressCard}
          overallPercent={record.overallPercent}
          passedCount={derived.passedCount}
          moduleCount={derived.moduleCount}
          hoursSpent={record.hoursSpent}
        />
      </div>

      {/* Inert, like every other control of this mock: there is nothing to filter yet. */}
      <div className={styles.filterRow}>
        <button className={styles.filter} type="button">
          <PanelIcon name="filter" className={styles.filterIcon} />
          {panel.modules.filterLabel}
        </button>
      </div>

      <ModuleGrid
        copy={panel.modules}
        modules={derived.modules}
        currentPercent={record.currentModulePercent}
      />
    </div>
  );
}
