"use client";

// Multi-step onboarding: about you > subjects (name, HL/SL, color) > study plan per subject >
// extracurriculars > daily study limit > review. One react-hook-form + zod form; Next checks
// only the current step, and nothing saves until Finish.
// Imports: @/components/onboarding/*, @/components/providers/DataProvider (completeOnboarding).
// Later: @/lib/actions/onboarding.actions (saveOnboarding). Redirects to /dashboard on finish.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { AboutYouStep } from "@/components/onboarding/AboutYouStep";
import { DailyLimitStep } from "@/components/onboarding/DailyLimitStep";
import { ExtracurricularsStep } from "@/components/onboarding/ExtracurricularsStep";
import { OnboardingSteps } from "@/components/onboarding/OnboardingSteps";
import { ReviewStep } from "@/components/onboarding/ReviewStep";
import {
  DEFAULT_DAILY_CAP_MINUTES,
  onboardingSchema,
  STEPS,
  type OnboardingValues,
} from "@/components/onboarding/schema";
import { StudyPlanForm } from "@/components/onboarding/StudyPlanForm";
import { SubjectPicker } from "@/components/onboarding/SubjectPicker";
import { useData } from "@/components/providers/DataProvider";
import { DEFAULT_WEEKEND_DAYS } from "@/constants";

const TITLES = STEPS.map((s) => s.title);

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useData();
  const [step, setStep] = useState(0);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      subjects: [],
      extracurriculars: [],
      daily_cap_minutes: DEFAULT_DAILY_CAP_MINUTES,
      weekend_days: DEFAULT_WEEKEND_DAYS,
    },
  });

  function goTo(next: number) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function finish(values: OnboardingValues) {
    completeOnboarding({
      profile: {
        name: values.name,
        graduation_year: values.graduation_year,
        diploma: values.diploma,
        daily_cap_minutes: values.daily_cap_minutes,
        weekend_days: values.weekend_days,
      },
      subjects: values.subjects.map((s) => ({
        name: s.name,
        level: s.level,
        color: s.color,
        predicted_grade: null,
        session_minutes: s.session_minutes,
        study_days: s.study_days,
        priority: s.priority,
      })),
      extracurriculars: values.extracurriculars,
    });
    router.push("/dashboard");
  }

  // Shouldn't happen (each step is checked on Next), but if it does, go to
  // the first step with a problem.
  function showFirstError(errors: FieldErrors<OnboardingValues>) {
    const index = STEPS.findIndex((s) => s.fields.some((f) => errors[f]));
    if (index >= 0) goTo(index);
  }

  async function next() {
    if (step === STEPS.length - 1) {
      await form.handleSubmit(finish, showFirstError)();
      return;
    }
    const valid = await form.trigger([...STEPS[step].fields]);
    if (valid) goTo(step + 1);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 pb-16 md:py-12">
      <p className="mb-8 text-xl font-bold text-primary">jadwaly</p>
      <FormProvider {...form}>
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <OnboardingSteps
            step={step}
            titles={TITLES}
            onBack={() => goTo(step - 1)}
            onNext={next}
          >
            {step === 0 && <AboutYouStep />}
            {step === 1 && <SubjectPicker />}
            {step === 2 && <StudyPlanForm />}
            {step === 3 && <ExtracurricularsStep />}
            {step === 4 && <DailyLimitStep />}
            {step === 5 && <ReviewStep onEdit={goTo} />}
          </OnboardingSteps>
        </form>
      </FormProvider>
    </main>
  );
}
