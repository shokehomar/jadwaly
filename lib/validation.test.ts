import { describe, expect, it } from "vitest";
import {
  newExtracurricularSchema,
  newStudyLogSchema,
  newSubjectSchema,
  newTaskSchema,
  profileChangesSchema,
  subjectChangesSchema,
  taskChangesSchema,
} from "@/lib/validation";

const ID = "3f2a1c6e-8b4d-4e7a-9c1b-2d5e6f7a8b9c";
const SUBJECT_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

const task = {
  id: ID,
  subject_id: SUBJECT_ID,
  title: "Physics IA draft",
  type: "IA",
  due_date: "2026-10-09",
  status: "Not started",
  priority: "High",
  notes: null,
};

describe("server action input checks", () => {
  it("accepts a valid new task", () => {
    expect(newTaskSchema.safeParse(task).success).toBe(true);
  });

  it("rejects user_id and unknown fields", () => {
    expect(newTaskSchema.safeParse({ ...task, user_id: "user_someone_else" }).success).toBe(false);
    expect(taskChangesSchema.safeParse({ status: "Completed", owner: "x" }).success).toBe(false);
    expect(profileChangesSchema.safeParse({ onboarding_complete: false }).success).toBe(false);
    expect(profileChangesSchema.safeParse({ id: "user_x" }).success).toBe(false);
  });

  it("rejects a bad id, a bad date, and an empty title", () => {
    expect(newTaskSchema.safeParse({ ...task, id: "task_01" }).success).toBe(false);
    expect(newTaskSchema.safeParse({ ...task, due_date: "9 Oct" }).success).toBe(false);
    expect(newTaskSchema.safeParse({ ...task, title: "   " }).success).toBe(false);
  });

  it("requires a subject for exams and IAs", () => {
    for (const type of ["Exam", "IA"]) {
      expect(newTaskSchema.safeParse({ ...task, type, subject_id: null }).success).toBe(false);
      expect(taskChangesSchema.safeParse({ type, subject_id: null }).success).toBe(false);
    }
    expect(newTaskSchema.safeParse({ ...task, type: "Study", subject_id: null }).success).toBe(true);
    expect(newTaskSchema.safeParse({ ...task, type: "EE", subject_id: null }).success).toBe(true);
  });

  it("accepts partial updates but not empty ones", () => {
    expect(taskChangesSchema.safeParse({ status: "Completed" }).success).toBe(true);
    expect(subjectChangesSchema.safeParse({ predicted_grade: 6 }).success).toBe(true);
    expect(profileChangesSchema.safeParse({ daily_cap_minutes: 180 }).success).toBe(true);
    expect(taskChangesSchema.safeParse({}).success).toBe(false);
  });

  it("checks weekday numbers, grades, and times", () => {
    const subject = {
      id: ID,
      name: "Physics",
      level: "HL",
      color: "#4A7FD4",
      predicted_grade: null,
      session_minutes: 60,
      study_days: [1, 3, 5],
      priority: "Medium",
    };
    expect(newSubjectSchema.safeParse(subject).success).toBe(true);
    expect(newSubjectSchema.safeParse({ ...subject, study_days: [7] }).success).toBe(false);
    expect(subjectChangesSchema.safeParse({ predicted_grade: 8 }).success).toBe(false);

    const gym = { id: ID, name: "Gym", days: [1], start_time: "18:00", duration_minutes: 60 };
    expect(newExtracurricularSchema.safeParse(gym).success).toBe(true);
    expect(newExtracurricularSchema.safeParse({ ...gym, days: [] }).success).toBe(false);
    expect(newExtracurricularSchema.safeParse({ ...gym, start_time: "25:00" }).success).toBe(false);

    const log = { id: ID, subject_id: SUBJECT_ID, date: "2026-09-30", minutes: 60 };
    expect(newStudyLogSchema.safeParse(log).success).toBe(true);
    expect(newStudyLogSchema.safeParse({ ...log, minutes: 0 }).success).toBe(false);
  });
});
