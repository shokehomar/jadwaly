"use client";

// Step 5: daily study limit (daily_cap_minutes), default 4 hours.
// Used by: app/onboarding/page.tsx

import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMinutes } from "@/lib/utils";
import type { OnboardingValues } from "./schema";

/** 30 minutes to 12 hours in half-hour steps */
const LIMITS = Array.from({ length: 24 }, (_, i) => (i + 1) * 30);

export function DailyLimitStep() {
  const { control } = useFormContext<OnboardingValues>();

  return (
    <Controller
      name="daily_cap_minutes"
      control={control}
      render={({ field }) => (
        <Field>
          <FieldLabel htmlFor="daily-limit">Most study time in one day</FieldLabel>
          <FieldDescription>
            On days with more planned study than this, lower-priority sessions move to other days.
            Exam prep is never moved.
          </FieldDescription>
          <Select<number>
            value={field.value}
            onValueChange={(minutes) => minutes !== null && field.onChange(minutes)}
          >
            <SelectTrigger id="daily-limit" className="w-40">
              <SelectValue>{(minutes: number) => formatMinutes(minutes)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LIMITS.map((minutes) => (
                <SelectItem key={minutes} value={minutes}>
                  {formatMinutes(minutes)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    />
  );
}
