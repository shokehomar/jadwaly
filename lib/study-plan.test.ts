import { describe, expect, it } from "vitest";
import {
  EXAM_PREP_MINUTES,
  extracurricularsForDay,
  generateWeek,
  sessionStatuses,
  weekStartOf,
} from "@/lib/study-plan";
import {
  mockProfile,
  mockStudyLogs,
  mockSubjects,
  mockTasks,
} from "@/constants/mock-data";
import type {
  Extracurricular,
  Priority,
  Profile,
  StudyLog,
  Subject,
  Task,
  Weekday,
  WeekPlan,
} from "@/types";

// Week of Monday 28 September 2026.
const MON = "2026-09-28";
const TUE = "2026-09-29";
const WED = "2026-09-30";
const THU = "2026-10-01";
const FRI = "2026-10-02";
const SAT = "2026-10-03";
const SUN = "2026-10-04";
const WEEK = [MON, TUE, WED, THU, FRI, SAT, SUN];
const EVERY_DAY: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

function profile(dailyCap: number): Profile {
  return {
    id: "user_1",
    name: "Test",
    graduation_year: 2027,
    diploma: true,
    onboarding_complete: true,
    daily_cap_minutes: dailyCap,
    weekend_days: [5, 6],
  };
}

function subject(
  id: string,
  sessionMinutes: number,
  studyDays: Weekday[],
  priority: Priority
): Subject {
  return {
    id,
    user_id: "user_1",
    name: id,
    level: "HL",
    color: "#000000",
    predicted_grade: null,
    session_minutes: sessionMinutes,
    study_days: studyDays,
    priority,
  };
}

function exam(subjectId: string, date: string): Task {
  return {
    id: `exam_${subjectId}_${date}`,
    user_id: "user_1",
    subject_id: subjectId,
    title: `${subjectId} exam`,
    type: "Exam",
    due_date: date,
    status: "Not started",
    priority: "High",
    notes: null,
  };
}

function log(subjectId: string, date: string, minutes: number): StudyLog {
  return { id: `log_${subjectId}_${date}`, user_id: "user_1", subject_id: subjectId, date, minutes };
}

/** Sessions on a day as "subject:minutes:reason" strings, for readable assertions */
function sessionsOn(plan: WeekPlan, date: string): string[] {
  const day = plan.days.find((d) => d.date === date);
  return (day?.sessions ?? []).map((s) => `${s.subjectId}:${s.minutes}:${s.reason}`);
}

function dayTotal(plan: WeekPlan, date: string): number {
  const day = plan.days.find((d) => d.date === date);
  return (day?.sessions ?? []).reduce((sum, s) => sum + s.minutes, 0);
}

function carriedOver(plan: WeekPlan): string[] {
  return plan.days.flatMap((d) =>
    d.sessions.filter((s) => s.reason === "carried over").map((s) => `${d.date}:${s.subjectId}:${s.minutes}`)
  );
}

describe("generateWeek", () => {
  it("plans a normal week from each subject's study days", () => {
    const math = subject("math", 90, EVERY_DAY, "High");
    const physics = subject("physics", 60, [1, 3, 5], "Medium");

    const plan = generateWeek(MON, MON, profile(240), [math, physics], [], []);

    expect(plan.days.map((d) => d.date)).toEqual(WEEK);
    expect(sessionsOn(plan, MON)).toEqual(["math:90:regular", "physics:60:regular"]);
    expect(sessionsOn(plan, TUE)).toEqual(["math:90:regular"]);
    expect(sessionsOn(plan, WED)).toEqual(["math:90:regular", "physics:60:regular"]);
    expect(sessionsOn(plan, THU)).toEqual(["math:90:regular"]);
    expect(sessionsOn(plan, FRI)).toEqual(["math:90:regular", "physics:60:regular"]);
    expect(sessionsOn(plan, SAT)).toEqual(["math:90:regular"]);
    expect(sessionsOn(plan, SUN)).toEqual(["math:90:regular"]);
    expect(plan.couldNotFit).toEqual([]);
  });

  it("adds exam prep before an exam and moves displaced sessions to before the exam", () => {
    // Chemistry exam on Friday: prep on Tue, Wed, Thu. Wed and Thu go over the
    // 150-minute cap, so their regular Chemistry sessions are removed.
    const math = subject("math", 90, EVERY_DAY, "High");
    const chem = subject("chem", 60, [3, 4], "Medium");

    const plan = generateWeek(MON, MON, profile(150), [math, chem], [exam("chem", FRI)], []);

    // Prep is added and never removed
    for (const date of [TUE, WED, THU]) {
      expect(sessionsOn(plan, date)).toContain(`chem:${EXAM_PREP_MINUTES}:exam prep`);
    }
    expect(sessionsOn(plan, FRI)).not.toContain(`chem:${EXAM_PREP_MINUTES}:exam prep`);
    expect(sessionsOn(plan, WED)).not.toContain("chem:60:regular");
    expect(sessionsOn(plan, THU)).not.toContain("chem:60:regular");

    // First displaced session fits on Monday, before the exam
    expect(carriedOver(plan)).toEqual([`${MON}:chem:60`]);

    // Friday has room (90 of 150) but is the exam day, so the second one
    // can't go there or later: it can't fit
    expect(dayTotal(plan, FRI)).toBe(90);
    expect(plan.couldNotFit).toEqual([
      { subjectId: "chem", minutes: 60, fromDate: THU, cause: "over cap" },
    ]);
  });

  it("carries a missed session over to today or later", () => {
    // Today is Thursday. Econ was done Monday but missed Tuesday. Physics got
    // 45 of 60 minutes on Monday, so 15 minutes are carried over.
    const math = subject("math", 90, EVERY_DAY, "High");
    const econ = subject("econ", 60, [1, 2], "Medium");
    const physics = subject("physics", 60, [1], "Medium");
    const logs = [
      log("math", MON, 90),
      log("math", TUE, 90),
      log("math", WED, 90),
      log("econ", MON, 60),
      log("physics", MON, 45),
    ];

    const plan = generateWeek(MON, THU, profile(240), [math, econ, physics], [], logs);

    // Past days keep what was planned
    expect(sessionsOn(plan, TUE)).toEqual(["math:90:regular", "econ:60:regular"]);

    // Same priority, so the earlier shortfall (Physics, Monday) goes first
    expect(sessionsOn(plan, THU)).toEqual([
      "math:90:regular",
      "physics:15:carried over",
      "econ:60:carried over",
    ]);
    expect(carriedOver(plan)).toHaveLength(2);
    expect(plan.couldNotFit).toEqual([]);
  });

  it("removes the lowest-priority session from a day over the cap and moves it", () => {
    // Saturday: 90 + 60 + 60 + 60 = 270 minutes, cap 240. Arabic and English
    // are both Low; English is listed last, so it goes.
    const math = subject("math", 90, EVERY_DAY, "High");
    const chem = subject("chem", 60, [6], "Medium");
    const arabic = subject("arabic", 60, [0, 6], "Low");
    const english = subject("english", 60, [0, 6], "Low");

    const plan = generateWeek(MON, MON, profile(240), [math, chem, arabic, english], [], []);

    expect(sessionsOn(plan, SAT)).toEqual([
      "math:90:regular",
      "chem:60:regular",
      "arabic:60:regular",
    ]);
    expect(carriedOver(plan)).toEqual([`${MON}:english:60`]);
    for (const date of WEEK) {
      expect(dayTotal(plan, date)).toBeLessThanOrEqual(240);
    }
    expect(plan.couldNotFit).toEqual([]);
  });

  it("lists sessions that don't fit anywhere instead of dropping them", () => {
    // Cap 150. Mon to Wed plan 210 minutes, so Econ (Low) is removed three
    // times. Only Sunday has room for one of them.
    const math = subject("math", 90, EVERY_DAY, "High");
    const physics = subject("physics", 60, [1, 2, 3, 4, 5, 6], "Medium");
    const econ = subject("econ", 60, [1, 2, 3], "Low");

    const plan = generateWeek(MON, MON, profile(150), [math, physics, econ], [], []);

    expect(carriedOver(plan)).toEqual([`${SUN}:econ:60`]);
    expect(plan.couldNotFit).toEqual([
      { subjectId: "econ", minutes: 60, fromDate: TUE, cause: "over cap" },
      { subjectId: "econ", minutes: 60, fromDate: WED, cause: "over cap" },
    ]);

    // Every planned minute is either on a day or in couldNotFit
    const planned = 90 * 7 + 60 * 6 + 60 * 3;
    const placed = WEEK.reduce((sum, date) => sum + dayTotal(plan, date), 0);
    const unplaced = plan.couldNotFit.reduce((sum, s) => sum + s.minutes, 0);
    expect(placed + unplaced).toBe(planned);
  });

  it("counts extra minutes logged on another day toward a missed session", () => {
    // Math missed Monday, but 180 minutes logged Tuesday cover Monday and Tuesday.
    const math = subject("math", 90, EVERY_DAY, "High");

    const plan = generateWeek(MON, WED, profile(240), [math], [], [log("math", TUE, 180)]);

    expect(carriedOver(plan)).toEqual([]);
    expect(plan.couldNotFit).toEqual([]);
  });
});

describe("generateWeek with Haya's mock data", () => {
  // Today is Tuesday. Nothing is logged this week, so Monday's sessions are missed.
  const plan = generateWeek(MON, TUE, mockProfile, mockSubjects, mockTasks, mockStudyLogs);

  it("keeps every day from today onward within her daily cap", () => {
    for (const date of WEEK.slice(1)) {
      expect(dayTotal(plan, date)).toBeLessThanOrEqual(mockProfile.daily_cap_minutes);
    }
  });

  it("places or lists every minute: the week's plan plus Monday's missed sessions", () => {
    const regular = mockSubjects.reduce((sum, s) => sum + s.session_minutes * s.study_days.length, 0);
    const prep = plan.days
      .flatMap((d) => d.sessions)
      .filter((s) => s.reason === "exam prep")
      .reduce((sum, s) => sum + s.minutes, 0);
    const placed = WEEK.reduce((sum, date) => sum + dayTotal(plan, date), 0);
    const unplaced = plan.couldNotFit.reduce((sum, s) => sum + s.minutes, 0);

    expect(placed + unplaced).toBe(regular + prep + dayTotal(plan, MON));
  });
});

describe("sessionStatuses", () => {
  it("marks past sessions done or missed, pooling logs across past days", () => {
    // Today is Thursday. 180 minutes of Math logged Tuesday cover Monday and
    // Tuesday; nothing covers Wednesday.
    const math = subject("math", 90, EVERY_DAY, "High");
    const logs = [log("math", TUE, 180)];
    const plan = generateWeek(MON, THU, profile(240), [math], [], logs);

    const statuses = sessionStatuses(plan, THU, logs);

    expect(statuses[0]).toEqual(["done"]); // Mon
    expect(statuses[1]).toEqual(["done"]); // Tue
    expect(statuses[2]).toEqual(["missed"]); // Wed
    expect(statuses[3]).toEqual(["open", "open"]); // Thu: regular + Wednesday carried over
    expect(statuses[4]).toEqual(["open"]); // Fri
  });

  it("fills today's sessions in order, skipping one the logged minutes can't cover", () => {
    // Today is Thursday, the day before a Chemistry exam: a 90-minute regular
    // session and a 60-minute prep session. 60 minutes logged today cover only
    // the prep. Tuesday's and Wednesday's prep were done, so nothing carries over.
    const chem = subject("chem", 90, [4], "Medium");
    const pastLogs = [log("chem", TUE, 60), log("chem", WED, 60)];
    const plan = generateWeek(MON, THU, profile(240), [chem], [exam("chem", FRI)], pastLogs);
    expect(sessionsOn(plan, THU)).toEqual(["chem:90:regular", "chem:60:exam prep"]);

    const doneSixty = [...pastLogs, log("chem", THU, 60)];
    const doneAll = [...pastLogs, log("chem", THU, 150)];
    expect(sessionStatuses(plan, THU, doneSixty)[3]).toEqual(["open", "done"]);
    expect(sessionStatuses(plan, THU, doneAll)[3]).toEqual(["done", "done"]);
  });

  it("keeps a carried-over session on today's plan after today's minutes are logged", () => {
    // Math missed Tuesday, so today (Wednesday) has a carried-over session.
    // Marking 90 minutes done today must not also cancel the carry-over:
    // today's logs only count toward today's sessions.
    const math = subject("math", 90, EVERY_DAY, "High");
    const logs = [log("math", MON, 90), log("math", WED, 90)];

    const plan = generateWeek(MON, WED, profile(240), [math], [], logs);

    expect(sessionsOn(plan, WED)).toEqual(["math:90:regular", "math:90:carried over"]);
    expect(sessionStatuses(plan, WED, logs)[2]).toEqual(["done", "open"]);
  });
});

describe("weekStartOf", () => {
  it("returns the Monday of the week", () => {
    expect(weekStartOf(MON)).toBe(MON);
    expect(weekStartOf(THU)).toBe(MON);
    expect(weekStartOf(SUN)).toBe(MON);
    expect(weekStartOf("2026-10-05")).toBe("2026-10-05");
  });
});

describe("extracurricularsForDay", () => {
  it("shows extracurriculars on their days and hides them on exam days", () => {
    const gym: Extracurricular = {
      id: "gym",
      user_id: "user_1",
      name: "Gym",
      days: EVERY_DAY,
      start_time: "18:00",
      duration_minutes: 60,
    };
    const club: Extracurricular = { ...gym, id: "club", name: "Club", days: [1, 3] };
    const tasks = [exam("chem", FRI)];

    expect(extracurricularsForDay(MON, [gym, club], tasks)).toEqual([gym, club]);
    expect(extracurricularsForDay(THU, [gym, club], tasks)).toEqual([gym]);
    expect(extracurricularsForDay(FRI, [gym, club], tasks)).toEqual([]);
  });
});
