// Shared types: Profile, Subject, StudyPlan, Task, Milestone, Assessment.
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
  | "Test"
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
  min_hours_week: number;
  max_hours_week: number;
  study_days: Weekday[];
}

/** The study plan fields stored on a subject. */
export type StudyPlan = Pick<
  Subject,
  "min_hours_week" | "max_hours_week" | "study_days"
>;

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

// Milestone: not defined yet. Whether IA, EE, and TOK milestones are regular
// tasks or a separate table is still undecided (see CLAUDE.md).
