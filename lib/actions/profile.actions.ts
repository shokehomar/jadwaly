"use server";

// updateProfile: change only the given profile fields (name, graduation year, diploma,
// daily limit, weekend). id and onboarding_complete can't be changed here.
// Imports: @/lib/actions/result, @/lib/validation. Used by: components/providers/DataProvider

import { invalid, updateRow, type ActionResult } from "@/lib/actions/result";
import { profileChangesSchema } from "@/lib/validation";
import type { Profile } from "@/types";

export async function updateProfile(
  changes: Partial<Omit<Profile, "id" | "onboarding_complete">>
): Promise<ActionResult> {
  const parsed = profileChangesSchema.safeParse(changes);
  return parsed.success ? updateRow("profiles", null, parsed.data) : invalid();
}
