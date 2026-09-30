"use client";

// Step 3, per subject: session length, frequency preset (every day, every other day,
// weekends, custom), study days as editable chips, and priority (default Medium).
// Presets fill study_days; editing a chip switches to Custom. "Every other day" is
// staggered across subjects (see presetDays in ./schema). "Weekends" uses the
// student's weekend_days (Friday and Saturday for now).
// Imports: ./StudyPlanControls. Used by: app/onboarding/page.tsx

import { useFormContext, useWatch } from "react-hook-form";
import { StudyPlanControls, type StudyPlanValue } from "./StudyPlanControls";
import { presetDays, staggerIndexFor, type OnboardingValues } from "./schema";

export function StudyPlanForm() {
  const { control, getValues, setValue } = useFormContext<OnboardingValues>();
  const subjects = useWatch({ control, name: "subjects" });

  function change(index: number, changes: Partial<StudyPlanValue>) {
    setValue(`subjects.${index}`, { ...getValues(`subjects.${index}`), ...changes });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Choose how long each study session is and which days you study each subject. Higher
        priority subjects keep their sessions when a day gets too full.
      </p>

      <ul className="flex flex-col gap-3">
        {subjects.map((subject, i) => (
          <li key={i} className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <h2 className="min-w-0 truncate font-medium">{subject.name}</h2>
              <span className="text-xs text-muted-foreground">{subject.level}</span>
            </div>

            <StudyPlanControls
              idPrefix={`subject-${i}`}
              subjectName={subject.name}
              color={subject.color}
              value={subject}
              onChange={(changes) => change(i, changes)}
              daysForPreset={(preset) =>
                presetDays(
                  preset,
                  staggerIndexFor(getValues("subjects"), i),
                  getValues("weekend_days")
                )
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
