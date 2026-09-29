// Shared types: Profile, Subject, StudyPlan, Task, Milestone, Assessment, Extracurricular, StudyLog.
// Shapes mirror the future database tables (see CLAUDE.md, Data model).
// Nullable columns are typed `T | null`, matching what Supabase will return.
// Dates are ISO strings ("YYYY-MM-DD").

export type Level = "HL" | "SL";

/** 0 = Sunday ... 6 = Saturday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TaskType =
  | "IA"
  | "EE"
  | "TOK"
  | "CAS"
  | "Exam"
  | "University"
  | "Study";

export type TaskStatus = "Not started" | "In progress" | "Completed";

export type Priority = "Low" | "Medium" | "High";

export interface Profile {
  /** Clerk user ID */
  id: string;
  name: string;
  graduation_year: number;
  /** false = non-diploma student: no CAS, EE, or TOK, and may take fewer than 6 subjects */
  diploma: boolean;
  onboarding_complete: boolean;
  /** Most study minutes the scheduler may plan in one day (default 240) */
  daily_cap_minutes: number;
  /** The student's weekend (default [5, 6], Friday and Saturday). Used by the "Weekends" preset and label */
  weekend_days: Weekday[];
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  level: Level;
  /** hex, e.g. "#62AD59" */
  color: string;
  /** 1 to 7 */
  predicted_grade: number | null;
  /** Length of one study session */
  session_minutes: number;
  /** Days with a session; onboarding presets (every day, weekends, ...) all save here */
  study_days: Weekday[];
  /** Used by the scheduler when a day is over the cap (default "Medium") */
  priority: Priority;
}

/** The study plan fields stored on a subject. */
export type StudyPlan = Pick<Subject, "session_minutes" | "study_days" | "priority">;

export interface Task {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  type: TaskType;
  due_date: string;
  status: TaskStatus;
  priority: Priority;
  notes: string | null;
}

export interface Assessment {
  id: string;
  user_id: string;
  subject_id: string;
  name: string;
  date: string;
  score: number;
  max_score: number;
}

/** Fixed weekly commitment, e.g. gym or club. */
export interface Extracurricular {
  id: string;
  user_id: string;
  name: string;
  days: Weekday[];
  /** 24-hour "HH:MM", e.g. "18:00" */
  start_time: string;
  duration_minutes: number;
}

/** A study session marked done. */
export interface StudyLog {
  id: string;
  user_id: string;
  subject_id: string;
  date: string;
  minutes: number;
}

// Milestones are regular tasks (see CLAUDE.md): an IA milestone is a task with
// type "IA" and a subject; EE and TOK milestones use those types.

// Scheduler output (lib/study-plan.ts). Not database rows, so camelCase.

export type SessionReason = "regular" | "exam prep" | "carried over";

/** One study session on a day. Sessions have no set time. */
export interface StudySession {
  subjectId: string;
  minutes: number;
  reason: SessionReason;
}

/** "open": today or later and not done yet */
export type SessionStatus = "done" | "missed" | "open";

export interface DayPlan {
  /** "YYYY-MM-DD" */
  date: string;
  sessions: StudySession[];
}

/** A session the scheduler had to move but found no room for. */
export interface UnscheduledSession {
  subjectId: string;
  minutes: number;
  /** The day it was originally planned */
  fromDate: string;
  cause: "missed" | "over cap";
}

export interface WeekPlan {
  /** Monday to Sunday */
  days: DayPlan[];
  couldNotFit: UnscheduledSession[];
}
