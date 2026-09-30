"use server";

// createSubject, updateSubject (any fields: study plan, predicted grade, ...), deleteSubject.
// Each edits one row. Deleting a subject clears subject_id on its tasks and deletes its
// assessments and study logs (database cascades).
// Imports: @/lib/actions/result, @/lib/validation. Used by: components/providers/DataProvider

import { deleteRow, insertRow, invalid, updateRow, type ActionResult } from "@/lib/actions/result";
import { idSchema, newSubjectSchema, subjectChangesSchema } from "@/lib/validation";
import type { Subject } from "@/types";

export async function createSubject(subject: Omit<Subject, "user_id">): Promise<ActionResult> {
  const parsed = newSubjectSchema.safeParse(subject);
  return parsed.success ? insertRow("subjects", parsed.data) : invalid();
}

export async function updateSubject(
  id: string,
  changes: Partial<Omit<Subject, "id" | "user_id">>
): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = subjectChangesSchema.safeParse(changes);
  return parsedId.success && parsed.success
    ? updateRow("subjects", parsedId.data, parsed.data)
    : invalid();
}

export async function deleteSubject(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  return parsedId.success ? deleteRow("subjects", parsedId.data) : invalid();
}
