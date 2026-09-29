"use client";

// Step 6: summary of everything, with planned study minutes for each weekday
// and days over the daily limit flagged. Edit links jump back to a step.
// Used by: app/onboarding/page.tsx

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { WEEK_ORDER, WEEKDAYS } from "@/constants";
import { cn, describeStudyDays, formatMinutes } from "@/lib/utils";
import { minutesByWeekday, type OnboardingValues } from "./schema";

interface ReviewStepProps {
  onEdit: (step: number) => void;
}

export function ReviewStep({ onEdit }: ReviewStepProps) {
  // Nothing is edited on this step, so a snapshot of the values is enough
  const values = useFormContext<OnboardingValues>().getValues();
  const cap = values.daily_cap_minutes;
  const totals = minutesByWeekday(values.subjects);

  return (
    <div className="flex flex-col gap-6">
      <Section title="About you" onEdit={() => onEdit(0)}>
        <p className="text-sm">
          {values.name}, graduating {values.graduation_year},{" "}
          {values.diploma ? "IB Diploma student" : "IB course student"}
        </p>
      </Section>

      <Section title="Subjects and study plan" onEdit={() => onEdit(1)}>
        <ul className="flex flex-col gap-2">
          {values.subjects.map((subject, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span
                aria-hidden
                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <span className="min-w-0">
                <span className="font-medium">{subject.name}</span>{" "}
                <span className="text-muted-foreground">{subject.level}</span>
                <span className="block text-muted-foreground">
                  {subject.study_days.length === 0
                    ? "No regular sessions"
                    : `${subject.session_minutes} min · ${describeStudyDays(subject.study_days, values.weekend_days)}`}
                  {" · "}
                  {subject.priority} priority
                </span>
              </span>
            </li>
          ))}
        </ul>
        <Button type="button" variant="link" className="h-auto self-start p-0" onClick={() => onEdit(2)}>
          Edit study plan
        </Button>
      </Section>

      <Section title="Extracurriculars" onEdit={() => onEdit(3)}>
        {values.extracurriculars.length === 0 ? (
          <p className="text-sm text-muted-foreground">None</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {values.extracurriculars.map((item, i) => (
              <li key={i}>
                <span className="font-medium">{item.name}</span>{" "}
                <span className="text-muted-foreground">
                  {describeStudyDays(item.days, values.weekend_days)} · {item.start_time},{" "}
                  {formatMinutes(item.duration_minutes)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Daily limit: ${formatMinutes(cap)}`} onEdit={() => onEdit(4)}>
        <p className="text-sm text-muted-foreground">Planned study time for each day of the week:</p>
        <ul className="flex flex-col gap-1.5">
          {WEEK_ORDER.map((day) => {
            const minutes = totals[day];
            const over = minutes > cap;
            return (
              <li key={day} className="flex flex-col gap-1 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="w-24 shrink-0">{WEEKDAYS[day].long}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                    <div
                      className={cn("h-full rounded-full", over ? "bg-destructive" : "bg-primary")}
                      style={{ width: `${Math.min((minutes / cap) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={cn("w-20 shrink-0 text-right", over && "font-medium text-destructive")}>
                    {minutes === 0 ? "None" : formatMinutes(minutes)}
                  </span>
                </div>
                {over && (
                  <p className="text-xs text-destructive">
                    Over by {formatMinutes(minutes - cap)}. Some sessions will move to other days.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">{title}</h2>
        <Button type="button" variant="link" className="h-auto p-0" onClick={onEdit}>
          Edit
        </Button>
      </div>
      {children}
    </section>
  );
}
