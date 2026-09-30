// Loads everything the signed-in user owns from Supabase, shaped like types/index.d.ts,
// for the data provider. Returns null when the user has no profile row (not onboarded).
// Server only. Imports: @/lib/supabase. Used by: app/(app)/layout.tsx

import { createSupabaseClient } from "@/lib/supabase";
import type { Assessment, Extracurricular, Profile, StudyLog, Subject, Task } from "@/types";

export interface UserData {
  profile: Profile;
  subjects: Subject[];
  tasks: Task[];
  assessments: Assessment[];
  extracurriculars: Extracurricular[];
  studyLogs: StudyLog[];
}

// Explicit columns, so rows match the TypeScript types exactly (created_at is left out).
const COLUMNS = {
  profiles: "id, name, graduation_year, diploma, onboarding_complete, daily_cap_minutes, weekend_days",
  subjects:
    "id, user_id, name, level, color, predicted_grade, session_minutes, study_days, priority",
  tasks: "id, user_id, subject_id, title, type, due_date, status, priority, notes",
  assessments: "id, user_id, subject_id, name, date, score, max_score",
  extracurriculars: "id, user_id, name, days, start_time, duration_minutes",
  studyLogs: "id, user_id, subject_id, date, minutes",
};

/**
 * RLS limits every query to the signed-in user's rows, so no user_id filter is needed.
 * Throws when a query fails, so a database problem shows as an error instead of an
 * empty account.
 */
export async function loadUserData(): Promise<UserData | null> {
  const supabase = createSupabaseClient();

  const profile = await supabase
    .from("profiles")
    .select(COLUMNS.profiles)
    .maybeSingle()
    .overrideTypes<Profile, { merge: false }>();
  if (profile.error) throw new Error(`Loading profile failed: ${profile.error.message}`);
  if (!profile.data) return null;

  const [subjects, tasks, assessments, extracurriculars, studyLogs] = await Promise.all([
    supabase
      .from("subjects")
      .select(COLUMNS.subjects)
      .order("created_at")
      .overrideTypes<Subject[], { merge: false }>(),
    supabase
      .from("tasks")
      .select(COLUMNS.tasks)
      .order("due_date")
      .overrideTypes<Task[], { merge: false }>(),
    supabase
      .from("assessments")
      .select(COLUMNS.assessments)
      .order("date")
      .overrideTypes<Assessment[], { merge: false }>(),
    supabase
      .from("extracurriculars")
      .select(COLUMNS.extracurriculars)
      .order("created_at")
      .overrideTypes<Extracurricular[], { merge: false }>(),
    supabase
      .from("study_logs")
      .select(COLUMNS.studyLogs)
      .order("date")
      .overrideTypes<StudyLog[], { merge: false }>(),
  ]);

  for (const [name, result] of Object.entries({ subjects, tasks, assessments, extracurriculars, studyLogs })) {
    if (result.error) throw new Error(`Loading ${name} failed: ${result.error.message}`);
  }

  return {
    profile: profile.data,
    subjects: subjects.data ?? [],
    tasks: tasks.data ?? [],
    assessments: assessments.data ?? [],
    extracurriculars: extracurriculars.data ?? [],
    studyLogs: studyLogs.data ?? [],
  };
}
