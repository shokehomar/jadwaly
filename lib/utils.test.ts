import { describe, expect, it } from "vitest";
import { daysUntil, describeStudyDays, isOverdue } from "@/lib/utils";
import type { Weekday } from "@/types";

const FRI_SAT: Weekday[] = [5, 6];
const SAT_SUN: Weekday[] = [6, 0];

describe("describeStudyDays", () => {
  it("calls the student's own weekend Weekends", () => {
    expect(describeStudyDays([5, 6], FRI_SAT)).toBe("Weekends");
    expect(describeStudyDays([6, 0], SAT_SUN)).toBe("Weekends");
    expect(describeStudyDays([0, 6], SAT_SUN)).toBe("Weekends");
  });

  it("lists the days when they aren't the student's weekend", () => {
    expect(describeStudyDays([6, 0], FRI_SAT)).toBe("Sat, Sun");
    expect(describeStudyDays([5, 6], SAT_SUN)).toBe("Fri, Sat");
    expect(describeStudyDays([6], FRI_SAT)).toBe("Sat");
  });

  it("handles every day, no days, and other day sets", () => {
    expect(describeStudyDays([0, 1, 2, 3, 4, 5, 6], FRI_SAT)).toBe("Every day");
    expect(describeStudyDays([], FRI_SAT)).toBe("No study days");
    expect(describeStudyDays([0, 1, 3, 5], SAT_SUN)).toBe("Mon, Wed, Fri, Sun");
  });
});

describe("date helpers take today from the caller", () => {
  it("flags tasks due before today as overdue", () => {
    expect(isOverdue("2026-09-29", "2026-09-30")).toBe(true);
    expect(isOverdue("2026-09-30", "2026-09-30")).toBe(false);
    expect(isOverdue("2026-10-01", "2026-09-30")).toBe(false);
  });

  it("counts whole days until a date, across months and a DST change", () => {
    expect(daysUntil("2026-09-30", "2026-09-30")).toBe(0);
    expect(daysUntil("2026-10-02", "2026-09-30")).toBe(2);
    expect(daysUntil("2026-09-28", "2026-09-30")).toBe(-2);
    expect(daysUntil("2026-11-02", "2026-10-30")).toBe(3); // spans the end of summer time in many zones
  });
});
