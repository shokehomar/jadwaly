import { describe, expect, it } from "vitest";
import {
  minutesByWeekday,
  newSubject,
  nextSubjectColor,
  onboardingSchema,
  presetDays,
  staggerIndexFor,
  subjectCountError,
  type OnboardingSubject,
  type OnboardingValues,
} from "@/components/onboarding/schema";
import { SUBJECT_COLORS } from "@/constants";
import type { Weekday } from "@/types";

const FRI_SAT: Weekday[] = [5, 6];
const SAT_SUN: Weekday[] = [6, 0];

function subjects(levels: ("HL" | "SL")[]): OnboardingSubject[] {
  const list: OnboardingSubject[] = [];
  levels.forEach((level, i) => list.push({ ...newSubject(list), name: `Subject ${i + 1}`, level }));
  return list;
}

function values(overrides: Partial<OnboardingValues>): OnboardingValues {
  return {
    name: "Haya",
    graduation_year: 2027,
    diploma: true,
    subjects: subjects(["HL", "HL", "HL", "SL", "SL", "SL"]),
    extracurriculars: [],
    daily_cap_minutes: 240,
    weekend_days: [5, 6],
    ...overrides,
  };
}

describe("subject rules", () => {
  it("requires exactly 6 subjects with 3 or 4 at HL for diploma students", () => {
    expect(subjectCountError(true, subjects(["HL", "HL", "HL", "SL", "SL", "SL"]))).toBeNull();
    expect(subjectCountError(true, subjects(["HL", "HL", "HL", "HL", "SL", "SL"]))).toBeNull();
    expect(subjectCountError(true, subjects(["HL", "HL", "HL", "SL", "SL"]))).toMatch(/exactly 6/);
    expect(subjectCountError(true, subjects(["HL", "HL", "SL", "SL", "SL", "SL"]))).toMatch(/3 or 4/);
    expect(subjectCountError(true, subjects(["HL", "HL", "HL", "HL", "HL", "SL"]))).toMatch(/3 or 4/);
  });

  it("lets non-diploma students take any number from 1", () => {
    expect(subjectCountError(false, [])).toMatch(/at least one/);
    expect(subjectCountError(false, subjects(["SL"]))).toBeNull();
    expect(subjectCountError(false, subjects(["HL", "HL", "HL", "HL", "HL", "HL", "HL"]))).toBeNull();
  });

  it("rejects duplicate subject names and accepts a subject with no study days", () => {
    const list = subjects(["HL", "HL", "HL", "SL", "SL", "SL"]);
    list[5] = { ...list[5], study_days: [], preset: "custom" };
    expect(onboardingSchema.safeParse(values({ subjects: list })).success).toBe(true);

    list[1] = { ...list[1], name: " subject 1 " };
    const result = onboardingSchema.safeParse(values({ subjects: list }));
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path.join("."))).toEqual(["subjects.1.name"]);
  });

  it("requires at least one day for each extracurricular", () => {
    const gym = { name: "Gym", days: [], start_time: "18:00", duration_minutes: 60 };
    expect(onboardingSchema.safeParse(values({ extracurriculars: [gym] })).success).toBe(false);
    expect(
      onboardingSchema.safeParse(values({ extracurriculars: [{ ...gym, days: [1] }] })).success
    ).toBe(true);
  });
});

describe("frequency presets", () => {
  it("fills study days for each preset", () => {
    expect(presetDays("every day", 0, FRI_SAT)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(presetDays("every other day", 0, FRI_SAT)).toEqual([1, 3, 5, 0]);
    expect(presetDays("custom", 0, FRI_SAT)).toBeNull();
  });

  it("uses the student's weekend for the Weekends preset", () => {
    expect(presetDays("weekends", 0, FRI_SAT)).toEqual([5, 6]);
    expect(presetDays("weekends", 0, SAT_SUN)).toEqual([0, 6]);
  });

  it("staggers every other day across subjects", () => {
    const list = subjects(["HL", "HL", "HL"]);
    expect(list.map((s) => s.study_days)).toEqual([
      [1, 3, 5, 0],
      [2, 4, 6],
      [1, 3, 5, 0],
    ]);

    // A subject on another preset doesn't count toward the alternation
    const mixed = [{ ...list[0], preset: "every day" as const }, list[1], list[2]];
    expect(staggerIndexFor(mixed, 2)).toBe(1);
    expect(presetDays("every other day", staggerIndexFor(mixed, 2), FRI_SAT)).toEqual([2, 4, 6]);
  });
});

describe("helpers", () => {
  it("assigns the first unused color", () => {
    expect(nextSubjectColor([])).toBe(SUBJECT_COLORS[0]);
    expect(nextSubjectColor([SUBJECT_COLORS[0], SUBJECT_COLORS[2]])).toBe(SUBJECT_COLORS[1]);
  });

  it("totals planned minutes per weekday", () => {
    const totals = minutesByWeekday([
      { session_minutes: 90, study_days: [0, 1, 2, 3, 4, 5, 6] },
      { session_minutes: 60, study_days: [6, 0] },
      { session_minutes: 60, study_days: [] },
    ]);
    expect(totals).toEqual({ 0: 150, 1: 90, 2: 90, 3: 90, 4: 90, 5: 90, 6: 150 });
  });
});
