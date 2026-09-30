"use server";

// createExtracurricular, updateExtracurricular, deleteExtracurricular. Each edits one row.
// Imports: @/lib/actions/result, @/lib/validation. Used by: components/providers/DataProvider

import { deleteRow, insertRow, invalid, updateRow, type ActionResult } from "@/lib/actions/result";
import {
  extracurricularChangesSchema,
  idSchema,
  newExtracurricularSchema,
} from "@/lib/validation";
import type { Extracurricular } from "@/types";

export async function createExtracurricular(
  extracurricular: Omit<Extracurricular, "user_id">
): Promise<ActionResult> {
  const parsed = newExtracurricularSchema.safeParse(extracurricular);
  return parsed.success ? insertRow("extracurriculars", parsed.data) : invalid();
}

export async function updateExtracurricular(
  id: string,
  changes: Partial<Omit<Extracurricular, "id" | "user_id">>
): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = extracurricularChangesSchema.safeParse(changes);
  return parsedId.success && parsed.success
    ? updateRow("extracurriculars", parsedId.data, parsed.data)
    : invalid();
}

export async function deleteExtracurricular(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  return parsedId.success ? deleteRow("extracurriculars", parsedId.data) : invalid();
}
