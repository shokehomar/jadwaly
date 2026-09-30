"use server";

// createTask, updateTask (any fields, including status), deleteTask.
// Imports: @/lib/actions/result, @/lib/validation. Used by: components/providers/DataProvider

import { deleteRow, insertRow, invalid, updateRow, type ActionResult } from "@/lib/actions/result";
import { idSchema, newTaskSchema, taskChangesSchema } from "@/lib/validation";
import type { Task } from "@/types";

export async function createTask(task: Omit<Task, "user_id">): Promise<ActionResult> {
  const parsed = newTaskSchema.safeParse(task);
  return parsed.success ? insertRow("tasks", parsed.data) : invalid();
}

export async function updateTask(
  id: string,
  changes: Partial<Omit<Task, "id" | "user_id">>
): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = taskChangesSchema.safeParse(changes);
  return parsedId.success && parsed.success ? updateRow("tasks", parsedId.data, parsed.data) : invalid();
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  return parsedId.success ? deleteRow("tasks", parsedId.data) : invalid();
}
