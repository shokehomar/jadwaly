// Onboarding form: zod schema for all six steps, which fields each step checks,
// and pure helpers (frequency presets, staggering, colors, minutes per weekday).
// Used by: app/onboarding/page.tsx, components/onboarding/*

import { z } from "zod";
import { PRIORITIES, SUBJECT_COLORS } from "@/constants";
import type { Weekday } from "@/types";

export const FREQUENCY_PRESETS = ["every day", "every other day", "weekends", "custom"] as const;
export type FrequencyPreset = (typeof FREQUENCY_PRESETS)[number];

export const FREQUENCY_LABELS: Record<FrequencyPreset, string> = {
  "every day": "Every day",
  "every other day": "Every other day",
  weekends: "Weekends",
  custom: "Custom",
};

/** "Every other day" alternates between these two sets across subjects */
export const EVERY_OTHER_DAY_SETS: [Weekday[], Weekday[]] = [
  [1, 3, 5, 0], // Mon, Wed, Fri, Sun
  [2, 4, 6], // Tue, Thu, Sat
];

export const DEFAULT_SESSION_MINUTES = 60;
export const DEFAULT_DAILY_CAP_MINUTES = 240;

const weekday = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

const subjectSchema = z.object({
  name: z.string().trim().min(1, "Enter the subject name").max(80, "Keep the name under 80 characters"),
  level: z.enum(["HL", "SL"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  session_minutes: z.number().int().min(15).max(180),
  /** Form only; not saved */
  preset: z.enum(FREQUENCY_PRESETS),
  /** May be empty: the subject then only gets exam prep */
  study_days: z.array(weekday),
  priority: z.enum(PRIORITIES),
});

const extracurricularSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(60, "Keep the name under 60 characters"),
  days: z.array(weekday).min(1, "Pick at least one day"),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a start time"),
  duration_minutes: z.number().int().min(15).max(600),
});

export const onboardingSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(50, "Keep your name under 50 characters"),
    graduation_year: z.number({ error: "Choose your graduation year" }).int(),
    diploma: z.boolean({ error: "Choose yes or no" }),
    subjects: z.array(subjectSchema),
    extracurriculars: z.array(extracurricularSchema),
    daily_cap_minutes: z.number().int().min(30).max(720),
    /** Not asked in onboarding yet; always DEFAULT_WEEKEND_DAYS */
    weekend_days: z.array(weekday).min(1),
  })
  .superRefine((values, ctx) => {
    const error = subjectCountError(values.diploma, values.subjects);
    if (error) ctx.addIssue({ code: "custom", path: ["subjects"], message: error });

    const seen = new Set<string>();
    values.subjects.forEach((subject, i) => {
      const key = subject.name.trim().toLowerCase();
      if (!key) return;
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["subjects", i, "name"], message: "You already added this subject" });
      }
      seen.add(key);
    });
  });

export type OnboardingValues = z.infer<typeof onboardingSchema>;
export type OnboardingSubject = OnboardingValues["subjects"][number];
export type OnboardingExtracurricular = OnboardingValues["extracurriculars"][number];

export const STEPS = [
  { title: "About you", fields: ["name", "graduation_year", "diploma"] },
  { title: "Subjects", fields: ["subjects"] },
  { title: "Study plan", fields: ["subjects"] },
  { title: "Extracurriculars", fields: ["extracurriculars"] },
  { title: "Daily study limit", fields: ["daily_cap_minutes"] },
  { title: "Review", fields: [] },
] as const satisfies readonly { title: string; fields: readonly (keyof OnboardingValues)[] }[];

/**
 * Diploma: exactly 6 subjects, 3 or 4 at HL. Non-diploma: at least 1.
 * Returns the message to show, or null when the rule is met.
 */
export function subjectCountError(
  diploma: boolean | undefined,
  subjects: { level: "HL" | "SL" }[]
): string | null {
  if (diploma) {
    if (subjects.length !== 6) {
      return `Diploma students take exactly 6 subjects. You have ${subjects.length}.`;
    }
    const hl = subjects.filter((s) => s.level === "HL").length;
    if (hl < 3 || hl > 4) {
      return `Diploma students take 3 or 4 subjects at HL. You have ${hl}.`;
    }
    return null;
  }
  return subjects.length === 0 ? "Add at least one subject." : null;
}

/**
 * Study days for a preset. `staggerIndex` is how many subjects before this one
 * use "every other day", so neighbours alternate between the two sets.
 * "weekends" uses the student's weekend_days. Returns null for "custom" (keep the current days).
 */
export function presetDays(
  preset: FrequencyPreset,
  staggerIndex: number,
  weekendDays: Weekday[]
): Weekday[] | null {
  switch (preset) {
    case "every day":
      return [0, 1, 2, 3, 4, 5, 6];
    case "every other day":
      return [...EVERY_OTHER_DAY_SETS[staggerIndex % 2]];
    case "weekends":
      return [...weekendDays].sort((a, b) => a - b);
    case "custom":
      return null;
  }
}

/** How many subjects before `index` use "every other day" */
export function staggerIndexFor(subjects: { preset: FrequencyPreset }[], index: number): number {
  return subjects.slice(0, index).filter((s) => s.preset === "every other day").length;
}

/** First palette color not already used; cycles through the palette when all are taken */
export function nextSubjectColor(usedColors: string[]): string {
  const used = new Set(usedColors.map((c) => c.toLowerCase()));
  return (
    SUBJECT_COLORS.find((c) => !used.has(c.toLowerCase())) ??
    SUBJECT_COLORS[usedColors.length % SUBJECT_COLORS.length]
  );
}

/**
 * A new subject: HL until there are 3 HL subjects, then SL; next unused color;
 * default plan of 60 min, every other day (staggered), Medium priority.
 */
export function newSubject(existing: OnboardingSubject[]): OnboardingSubject {
  const hlCount = existing.filter((s) => s.level === "HL").length;
  return {
    name: "",
    level: hlCount < 3 ? "HL" : "SL",
    color: nextSubjectColor(existing.map((s) => s.color)),
    session_minutes: DEFAULT_SESSION_MINUTES,
    preset: "every other day",
    study_days: EVERY_OTHER_DAY_SETS[staggerIndexFor(existing, existing.length) % 2].slice(),
    priority: "Medium",
  };
}

/** Planned regular study minutes on each weekday (index 0 = Sunday) */
export function minutesByWeekday(
  subjects: { session_minutes: number; study_days: Weekday[] }[]
): Record<Weekday, number> {
  const totals: Record<Weekday, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const subject of subjects) {
    for (const day of new Set(subject.study_days)) totals[day] += subject.session_minutes;
  }
  return totals;
}

/** What public.save_onboarding (supabase/schema.sql) expects */
export interface OnboardingPayload {
  profile: {
    name: string;
    graduation_year: number;
    diploma: boolean;
    daily_cap_minutes: number;
    weekend_days: Weekday[];
  };
  subjects: {
    name: string;
    level: "HL" | "SL";
    color: string;
    session_minutes: number;
    study_days: Weekday[];
    priority: OnboardingSubject["priority"];
  }[];
  extracurriculars: OnboardingExtracurricular[];
}

/** Form values -> save_onboarding payload (drops the form-only preset field) */
export function toOnboardingPayload(values: OnboardingValues): OnboardingPayload {
  return {
    profile: {
      name: values.name,
      graduation_year: values.graduation_year,
      diploma: values.diploma,
      daily_cap_minutes: values.daily_cap_minutes,
      weekend_days: values.weekend_days,
    },
    subjects: values.subjects.map((s) => ({
      name: s.name,
      level: s.level,
      color: s.color,
      session_minutes: s.session_minutes,
      study_days: s.study_days,
      priority: s.priority,
    })),
    extracurriculars: values.extracurriculars.map((e) => ({
      name: e.name,
      days: e.days,
      start_time: e.start_time,
      duration_minutes: e.duration_minutes,
    })),
  };
}
