// Shared result type and row helpers for server actions. Not a "use server" file itself
// (those may only export async actions); the action files call these.
// Server only. Imports: @clerk/nextjs/server, @/lib/supabase. Used by: lib/actions/*.actions.ts

import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

export type ActionResult = { ok: true } | { ok: false; error: string };

type Table = "tasks" | "study_logs" | "subjects" | "extracurriculars" | "profiles";

const SIGNED_OUT: ActionResult = { ok: false, error: "You're signed out. Sign in again." };
const INVALID: ActionResult = { ok: false, error: "That change isn't valid." };
const FAILED: ActionResult = { ok: false, error: "Couldn't save that change." };

/** For inputs that fail validation */
export function invalid(): ActionResult {
  return INVALID;
}

async function client() {
  const { userId } = await auth();
  return userId ? { userId, supabase: createSupabaseClient() } : null;
}

function failed(action: string, table: Table, message: string): ActionResult {
  console.error(`${action} ${table} failed:`, message);
  return FAILED;
}

/** Insert one row. user_id is left to the database default (the Clerk user in the JWT). */
export async function insertRow(table: Table, row: object): Promise<ActionResult> {
  const session = await client();
  if (!session) return SIGNED_OUT;
  const { error } = await session.supabase.from(table).insert(row);
  return error ? failed("insert", table, error.message) : { ok: true };
}

/**
 * Update only the given fields of one row. RLS limits it to the user's own rows,
 * so a row that isn't found (or isn't theirs) updates nothing: that's a failure.
 * Profiles are keyed by the user ID itself.
 */
export async function updateRow(table: Table, id: string | null, changes: object): Promise<ActionResult> {
  const session = await client();
  if (!session) return SIGNED_OUT;
  const { data, error } = await session.supabase
    .from(table)
    .update(changes)
    .eq("id", id ?? session.userId)
    .select("id");
  if (error) return failed("update", table, error.message);
  return data.length === 1 ? { ok: true } : failed("update", table, "row not found");
}

/** Delete one row. A row that's already gone counts as deleted. */
export async function deleteRow(table: Table, id: string): Promise<ActionResult> {
  const session = await client();
  if (!session) return SIGNED_OUT;
  const { error } = await session.supabase.from(table).delete().eq("id", id);
  return error ? failed("delete", table, error.message) : { ok: true };
}
