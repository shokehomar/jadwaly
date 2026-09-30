// Zod schemas for what server actions accept, matching the database rows (supabase/schema.sql).
// Inputs are strict: unknown fields (e.g. user_id, which the database fills in) are rejected.
// Used by: lib/actions/*, components/onboarding/schema

import { z } from "zod";
import { PRIORITIES, STATUSES, TASK_TYPES, TASK_TYPES_NEEDING_SUBJECT } from "@/constants";

export const weekdaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const idSchema = z.uuid();
const dateSchema = z.iso.date();
const nonEmpty = <T extends object>(changes: T) => Object.keys(changes).length > 0;

// Tasks ----------------------------------------------------------------------

const taskFields = {
  subject_id: idSchema.nullable(),
  title: z.string().trim().min(1).max(120),
  type: z.enum(TASK_TYPES),
  due_date: dateSchema,
  status: z.enum(STATUSES),
  priority: z.enum(PRIORITIES),
  notes: z.string().max(1000).nullable(),
};

const needsSubject = (type: string | undefined) =>
  type !== undefined && (TASK_TYPES_NEEDING_SUBJECT as readonly string[]).includes(type);

/** Exams and IAs must belong to a subject */
export const newTaskSchema = z
  .strictObject({ id: idSchema, ...taskFields })
  .refine((t) => !needsSubject(t.type) || t.subject_id !== null, {
    message: "Exams and IAs need a subject",
    path: ["subject_id"],
  });

export const taskChangesSchema = z
  .strictObject(taskFields)
  .partial()
  .refine(nonEmpty, "No changes")
  .refine((c) => !(needsSubject(c.type) && c.subject_id === null), {
    message: "Exams and IAs need a subject",
    path: ["subject_id"],
  });

// Study logs -----------------------------------------------------------------

export const newStudyLogSchema = z.strictObject({
  id: idSchema,
  subject_id: idSchema,
  date: dateSchema,
  minutes: z.number().int().min(1).max(1440),
});

// Subjects -------------------------------------------------------------------

const subjectFields = {
  name: z.string().trim().min(1).max(80),
  level: z.enum(["HL", "SL"]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  predicted_grade: z.number().int().min(1).max(7).nullable(),
  session_minutes: z.number().int().min(1).max(1440),
  study_days: z.array(weekdaySchema),
  priority: z.enum(PRIORITIES),
};

export const newSubjectSchema = z.strictObject({ id: idSchema, ...subjectFields });
export const subjectChangesSchema = z
  .strictObject(subjectFields)
  .partial()
  .refine(nonEmpty, "No changes");

// Extracurriculars -----------------------------------------------------------

const extracurricularFields = {
  name: z.string().trim().min(1).max(60),
  days: z.array(weekdaySchema).min(1),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration_minutes: z.number().int().min(1).max(1440),
};

export const newExtracurricularSchema = z.strictObject({ id: idSchema, ...extracurricularFields });
export const extracurricularChangesSchema = z
  .strictObject(extracurricularFields)
  .partial()
  .refine(nonEmpty, "No changes");

// Profile --------------------------------------------------------------------

/** id and onboarding_complete can't be changed here */
export const profileChangesSchema = z
  .strictObject({
    name: z.string().trim().min(1).max(50),
    graduation_year: z.number().int().min(2000).max(2100),
    diploma: z.boolean(),
    daily_cap_minutes: z.number().int().min(1).max(1440),
    weekend_days: z.array(weekdaySchema).min(1),
  })
  .partial()
  .refine(nonEmpty, "No changes");
