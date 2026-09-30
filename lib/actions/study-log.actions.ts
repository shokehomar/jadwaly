"use server";

// createStudyLog (a study session marked done), deleteStudyLog (undo).
// Imports: @/lib/actions/result, @/lib/validation. Used by: components/providers/DataProvider

import { deleteRow, insertRow, invalid, type ActionResult } from "@/lib/actions/result";
import { idSchema, newStudyLogSchema } from "@/lib/validation";
import type { StudyLog } from "@/types";

export async function createStudyLog(log: Omit<StudyLog, "user_id">): Promise<ActionResult> {
  const parsed = newStudyLogSchema.safeParse(log);
  return parsed.success ? insertRow("study_logs", parsed.data) : invalid();
}

export async function deleteStudyLog(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  return parsedId.success ? deleteRow("study_logs", parsedId.data) : invalid();
}
