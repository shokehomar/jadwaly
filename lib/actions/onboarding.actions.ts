"use server";

// saveOnboarding: saves profile, subjects (with study plans), and extracurriculars in
// one transaction through public.save_onboarding (supabase/schema.sql). On a redo it
// replaces the old subjects and extracurriculars and clears tasks, assessments, and
// study logs. Redirects to /dashboard when saved.
// Imports: @/lib/supabase, @/components/onboarding/schema

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  onboardingSchema,
  toOnboardingPayload,
  type OnboardingValues,
} from "@/components/onboarding/schema";
import { createSupabaseClient } from "@/lib/supabase";

export async function saveOnboarding(values: OnboardingValues): Promise<{ error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "You're signed out. Sign in again to save." };

  // Check again on the server; the client's checks can be bypassed.
  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Some answers aren't valid. Go back through the steps and check them." };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase.rpc("save_onboarding", {
    payload: toOnboardingPayload(parsed.data),
  });
  if (error) {
    console.error("save_onboarding failed:", error.message);
    return { error: "Couldn't save your answers. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
