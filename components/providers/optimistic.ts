// Pure helpers for undoing an optimistic change when its server action fails.
// Each one puts back only what that change touched, so other changes made in the
// meantime are kept.
// Used by: components/providers/DataProvider

interface Row {
  id: string;
}

/** Remove a row by id (undo an add) */
export function removeById<T extends Row>(list: T[], id: string): T[] {
  return list.filter((row) => row.id !== id);
}

/**
 * Undo an update: each changed field goes back to its previous value, but only if
 * it still holds the value this change set (a later edit to the same field wins).
 */
export function revertFields<T extends object>(
  current: T,
  changes: NoInfer<Partial<T>>,
  previous: NoInfer<T>
): T {
  const next = { ...current };
  for (const key of Object.keys(changes) as (keyof T)[]) {
    if (current[key] === changes[key]) next[key] = previous[key];
  }
  return next;
}

/** revertFields for one row in a list */
export function revertRow<T extends Row>(
  list: T[],
  id: string,
  changes: NoInfer<Partial<T>>,
  previous: NoInfer<T>
): T[] {
  return list.map((row) => (row.id === id ? revertFields(row, changes, previous) : row));
}

/** Undo a delete: put the row back at its old position (unless it's already there) */
export function restoreAt<T extends Row>(list: T[], row: T, index: number): T[] {
  if (list.some((r) => r.id === row.id)) return list;
  const next = [...list];
  next.splice(Math.min(index, next.length), 0, row);
  return next;
}

/** Undo a cascade delete: add back rows that aren't in the list */
export function restoreRows<T extends Row>(list: T[], rows: T[]): T[] {
  const present = new Set(list.map((r) => r.id));
  const missing = rows.filter((r) => !present.has(r.id));
  return missing.length === 0 ? list : [...list, ...missing];
}

/** Undo "clear subject_id" on a deleted subject's tasks (only ones still without a subject) */
export function relinkTasks<T extends Row & { subject_id: string | null }>(
  tasks: T[],
  taskIds: Set<string>,
  subjectId: string
): T[] {
  return tasks.map((t) =>
    taskIds.has(t.id) && t.subject_id === null ? { ...t, subject_id: subjectId } : t
  );
}
