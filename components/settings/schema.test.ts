import { describe, expect, it } from "vitest";
import {
  changedFields,
  newSubjectDefaults,
  subjectToForm,
  subjectWarnings,
} from "@/components/settings/schema";
import type { Subject, Weekday } from "@/types";

function subject(name: string, level: "HL" | "SL", studyDays: Weekday[] = [1, 3, 5, 0]): Subject {
  return {
    id: name,
    user_id: "user_1",
    name,
    level,
    color: "#2BA5A0",
    predicted_grade: null,
    session_minutes: 60,
    study_days: studyDays,
    priority: "Medium",
  };
}

const six = [
  subject("Math", "HL"),
  subject("Physics", "HL"),
  subject("Chemistry", "HL"),
  subject("Economics", "SL"),
  subject("Arabic", "SL"),
  subject("English", "SL"),
];

describe("settings warnings", () => {
  it("warns instead of blocking when a diploma student breaks the subject rules", () => {
    expect(subjectWarnings(true, six)).toEqual([]);
    expect(subjectWarnings(true, six.slice(0, 5))).toEqual([
      "Diploma students take exactly 6 subjects. You have 5.",
    ]);
    const twoHl = six.map((s, i) => (i === 2 ? { ...s, level: "SL" as const } : s));
    expect(subjectWarnings(true, twoHl)).toEqual([
      "Diploma students take 3 or 4 subjects at HL. You have 2.",
    ]);
    expect(subjectWarnings(false, six.slice(0, 2))).toEqual([]);
    expect(subjectWarnings(false, [])).toEqual(["Add at least one subject."]);
  });

  it("warns about repeated subject names", () => {
    expect(subjectWarnings(false, [subject("Physics", "HL"), subject(" physics", "SL")])).toEqual([
      "physics is listed more than once.",
    ]);
  });
});

describe("settings form helpers", () => {
  it("shows a saved subject with the preset its days match", () => {
    expect(subjectToForm(subject("Arabic", "SL", [5, 6]), [5, 6]).preset).toBe("weekends");
    expect(subjectToForm(subject("Math", "HL", [1]), [5, 6]).preset).toBe("custom");
  });

  it("sets up a new subject staggered against the others", () => {
    const defaults = newSubjectDefaults([subject("Math", "HL"), subject("Physics", "HL")]);
    expect(defaults.level).toBe("HL");
    expect(defaults.study_days).toEqual([2, 4, 6]);
    expect(newSubjectDefaults(six.slice(0, 3)).level).toBe("SL");
  });

  it("sends only the fields that changed", () => {
    const saved = { name: "Math", study_days: [1, 3] as Weekday[], priority: "Medium" };
    expect(changedFields(saved, { name: "Math", study_days: [1, 3], priority: "High" })).toEqual({
      priority: "High",
    });
    expect(changedFields(saved, { study_days: [1, 3, 5] })).toEqual({ study_days: [1, 3, 5] });
    expect(changedFields(saved, { name: "Math" })).toEqual({});
  });
});
