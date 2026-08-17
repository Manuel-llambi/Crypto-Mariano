import type { Metadata } from "next";

import { ContinueCard } from "@/components/sections/ContinueCard";
import { ModuleGrid } from "@/components/sections/ModuleGrid";
import { ProgressCard } from "@/components/sections/ProgressCard";
import { PanelIcon } from "@/components/ui/PanelIcon";
import { panel, program, site } from "@/lib/content";
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
 * Nothing authenticates and nothing guards the route: 6.7 still holds, and this
 * screen is reached both from the control of `/acceso` and by typing the
 * address, which are the same thing until there is a session to check.
 */
export default function PanelPage() {
  const { record } = panel;
  const derived = derivePanel(program.modules, record);

  return (
    <div className={styles.page}>
      <header className={styles.welcome}>
        <p className={styles.eyebrow}>{panel.welcome.eyebrow}</p>
        <h1 className={styles.greeting}>
          {panel.welcome.greeting} {panel.student.name}
        </h1>
        <p className={styles.body}>{panel.welcome.body}</p>
      </header>

      <hr className={styles.rule} />

      <div className={styles.top}>
        <ContinueCard
          copy={panel.continueCard}
          module={derived.current}
          estimatedMinutes={record.estimatedMinutes}
          attachmentCount={record.attachmentCount}
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
