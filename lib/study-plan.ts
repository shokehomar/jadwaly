// Pure logic: build a week of study sessions from each subject's study plan (session_minutes,
// study_days, priority), exams, and study logs; no UI or DB code. Rules: CLAUDE.md > Scheduling.
// Used by: components/dashboard/TodayPlan, lib/actions/study-plan.actions

import type {
  DayPlan,
  Extracurricular,
  Priority,
  Profile,
  StudyLog,
  StudySession,
  Subject,
  Task,
  UnscheduledSession,
  Weekday,
  WeekPlan,
} from "@/types";

export const EXAM_PREP_DAYS = 3;
export const EXAM_PREP_MINUTES = 60;

const PRIORITY_RANK: Record<Priority, number> = { Low: 1, Medium: 2, High: 3 };

// Dates are "YYYY-MM-DD" strings. Date math runs in UTC so the result never
// depends on the time zone of the machine running it.
function toUtcMs(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function shiftDate(date: string, days: number): string {
  return new Date(toUtcMs(date) + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function weekdayOf(date: string): Weekday {
  return new Date(toUtcMs(date)).getUTCDay() as Weekday;
}

function totalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + s.minutes, 0);
}

/**
 * Builds the study plan for one week.
 * @param weekStart Monday of the week, "YYYY-MM-DD"
 * @param today "YYYY-MM-DD"; days before it are in the past, sessions are only placed from it onward
 */
export function generateWeek(
  weekStart: string,
  today: string,
  profile: Profile,
  subjects: Subject[],
  tasks: Task[],
  studyLogs: StudyLog[]
): WeekPlan {
  const cap = profile.daily_cap_minutes;
  const days: DayPlan[] = Array.from({ length: 7 }, (_, i) => ({
    date: shiftDate(weekStart, i),
    sessions: [],
  }));
  const weekEnd = days[6].date;

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const subjectOrder = new Map(subjects.map((s, i) => [s.id, i]));
  const rank = (subjectId: string) => PRIORITY_RANK[subjectById.get(subjectId)?.priority ?? "Medium"];
  const order = (subjectId: string) => subjectOrder.get(subjectId) ?? subjects.length;

  const exams = tasks.flatMap((t) =>
    t.type === "Exam" && t.status !== "Completed" && t.subject_id && subjectById.has(t.subject_id)
      ? [{ subjectId: t.subject_id, date: t.due_date }]
      : []
  );

  // 1. Base plan: one session per subject on each of its study days.
  for (const day of days) {
    const weekday = weekdayOf(day.date);
    for (const subject of subjects) {
      if (subject.study_days.includes(weekday)) {
        day.sessions.push({ subjectId: subject.id, minutes: subject.session_minutes, reason: "regular" });
      }
    }
  }

  // 2. Exam prep on each of the EXAM_PREP_DAYS days before an exam (not the exam day).
  for (const exam of exams) {
    for (let i = 1; i <= EXAM_PREP_DAYS; i++) {
      const date = shiftDate(exam.date, -i);
      days
        .find((d) => d.date === date)
        ?.sessions.push({ subjectId: exam.subjectId, minutes: EXAM_PREP_MINUTES, reason: "exam prep" });
    }
  }

  // Sessions waiting for a new day (missed or removed for the cap).
  const toPlace: UnscheduledSession[] = [];

  // 3. Missed sessions. Logs are matched per subject across the week, not per
  // day, so minutes logged on any day from Monday to today cover a shortfall on
  // another (e.g. a carried-over session done later). Missed minutes go back in
  // chunks of session_minutes, with any remainder as a shorter final chunk.
  const lastLogDate = today < weekEnd ? today : weekEnd;
  const pastDays = days.filter((d) => d.date < today);
  for (const subject of subjects) {
    const logged = studyLogs
      .filter((l) => l.subject_id === subject.id && l.date >= weekStart && l.date <= lastLogDate)
      .reduce((sum, l) => sum + l.minutes, 0);

    let planned = 0;
    let firstShortfall: string | null = null;
    for (const day of pastDays) {
      planned += totalMinutes(day.sessions.filter((s) => s.subjectId === subject.id));
      if (firstShortfall === null && planned > logged) firstShortfall = day.date;
    }

    let missed = Math.max(0, planned - logged);
    if (missed === 0 || firstShortfall === null) continue;
    const chunk = subject.session_minutes > 0 ? subject.session_minutes : missed;
    while (missed > 0) {
      const minutes = Math.min(chunk, missed);
      toPlace.push({ subjectId: subject.id, minutes, fromDate: firstShortfall, cause: "missed" });
      missed -= minutes;
    }
  }

  // 4. Daily cap, from today onward: remove sessions lowest priority first
  // (ties: the subject listed last) until the day fits. Exam prep stays.
  const firstOpenDate = today > weekStart ? today : weekStart;
  const openDays = days.filter((d) => d.date >= firstOpenDate);
  for (const day of openDays) {
    let total = totalMinutes(day.sessions);
    if (total <= cap) continue;
    const removable = day.sessions
      .filter((s) => s.reason !== "exam prep")
      .sort((a, b) => rank(a.subjectId) - rank(b.subjectId) || order(b.subjectId) - order(a.subjectId));
    for (const session of removable) {
      if (total <= cap) break;
      day.sessions.splice(day.sessions.indexOf(session), 1);
      total -= session.minutes;
      toPlace.push({ subjectId: session.subjectId, minutes: session.minutes, fromDate: day.date, cause: "over cap" });
    }
  }

  // 5. Reschedule, highest priority first (ties: earliest original day, then
  // subject order), onto the earliest day from today to Sunday with room. A
  // subject with an upcoming exam must be placed before the exam date.
  // 6. Anything left goes in couldNotFit; nothing is dropped.
  toPlace.sort(
    (a, b) =>
      rank(b.subjectId) - rank(a.subjectId) ||
      a.fromDate.localeCompare(b.fromDate) ||
      order(a.subjectId) - order(b.subjectId)
  );
  const couldNotFit: UnscheduledSession[] = [];
  for (const item of toPlace) {
    const nextExam = exams
      .filter((e) => e.subjectId === item.subjectId && e.date >= today)
      .map((e) => e.date)
      .sort()[0];
    const target = openDays.find(
      (d) =>
        (nextExam === undefined || d.date < nextExam) &&
        totalMinutes(d.sessions) + item.minutes <= cap
    );
    if (target) {
      target.sessions.push({ subjectId: item.subjectId, minutes: item.minutes, reason: "carried over" });
    } else {
      couldNotFit.push(item);
    }
  }

  return { days, couldNotFit };
}

/** Extracurriculars on a given day. Hidden on days with an exam. */
export function extracurricularsForDay(
  date: string,
  extracurriculars: Extracurricular[],
  tasks: Task[]
): Extracurricular[] {
  if (tasks.some((t) => t.type === "Exam" && t.due_date === date)) return [];
  const weekday = weekdayOf(date);
  return extracurriculars.filter((e) => e.days.includes(weekday));
}
