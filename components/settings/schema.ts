// Settings forms: profile schema, defaults for a new subject, and the onboarding
// rules shown as warnings (they don't block saving; a student may be mid-change).
// Subject and extracurricular forms reuse the onboarding schemas.
// Used by: components/settings/*

import { z } from "zod";
import {
  everyOtherDaySetFor,
  nextSubjectColor,
  presetFor,
  subjectCountError,
  type OnboardingSubject,
} from "@/components/onboarding/schema";
import type { Subject, Weekday } from "@/types";

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(50, "Keep your name under 50 characters"),
  graduation_year: z.number().int(),
  diploma: z.boolean(),
  daily_cap_minutes: z.number().int().min(30).max(720),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/** A subject as the settings form edits it (the preset is form-only) */
export type SubjectFormValues = OnboardingSubject;

export function subjectToForm(subject: Subject, weekendDays: Weekday[]): SubjectFormValues {
  return {
    name: subject.name,
    level: subject.level,
    color: subject.color,
    session_minutes: subject.session_minutes,
    preset: presetFor(subject.study_days, weekendDays),
    study_days: subject.study_days,
    priority: subject.priority,
  };
}

/**
 * Defaults for a subject added in Settings: HL until there are 3 HL subjects, the
 * next unused color, 60 minutes every other day (on the less used set), Medium.
 */
export function newSubjectDefaults(existing: Subject[]): SubjectFormValues {
  return {
    name: "",
    level: existing.filter((s) => s.level === "HL").length < 3 ? "HL" : "SL",
    color: nextSubjectColor(existing.map((s) => s.color)),
    session_minutes: 60,
    preset: "every other day",
    study_days: everyOtherDaySetFor(existing.map((s) => s.study_days)),
    priority: "Medium",
  };
}

/** The onboarding subject rules, plus repeated names, as warnings */
export function subjectWarnings(diploma: boolean, subjects: Subject[]): string[] {
  const warnings: string[] = [];
  const countError = subjectCountError(diploma, subjects);
  if (countError) warnings.push(countError);

  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const s of subjects) {
    const key = s.name.trim().toLowerCase();
    if (seen.has(key)) repeated.add(s.name.trim());
    seen.add(key);
  }
  for (const name of repeated) warnings.push(`${name} is listed more than once.`);
  return warnings;
}

/** Only the fields that differ from the saved row (arrays compared by value) */
export function changedFields<T extends object>(saved: T, edited: Partial<T>): Partial<T> {
  const changes: Partial<T> = {};
  for (const key of Object.keys(edited) as (keyof T)[]) {
    if (JSON.stringify(saved[key]) !== JSON.stringify(edited[key])) changes[key] = edited[key];
  }
  return changes;
}
