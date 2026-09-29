"use client";

// Step 3, per subject: session length, frequency preset (every day, every other day,
// weekends, custom), study days as editable chips, and priority (default Medium).
// "Weekends" uses the student's weekend_days (Friday and Saturday for now).
// Presets fill study_days; editing a chip switches to Custom. "Every other day" is
// staggered across subjects (see presetDays in ./schema).
// Imports: @/constants (PRIORITIES), ./DayChips. Used by: app/onboarding/page.tsx

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITIES } from "@/constants";
import { formatMinutes } from "@/lib/utils";
import type { Weekday } from "@/types";
import { ChoiceButtons } from "./ChoiceButtons";
import { DayChips } from "./DayChips";
import {
  FREQUENCY_LABELS,
  FREQUENCY_PRESETS,
  presetDays,
  staggerIndexFor,
  type FrequencyPreset,
  type OnboardingValues,
} from "./schema";

/** 15 to 180 minutes in 15-minute steps */
const SESSION_LENGTHS = Array.from({ length: 12 }, (_, i) => (i + 1) * 15);

export function StudyPlanForm() {
  const { control, getValues, setValue } = useFormContext<OnboardingValues>();
  const subjects = useWatch({ control, name: "subjects" });

  function choosePreset(index: number, preset: FrequencyPreset) {
    setValue(`subjects.${index}.preset`, preset);
    const days = presetDays(
      preset,
      staggerIndexFor(getValues("subjects"), index),
      getValues("weekend_days")
    );
    if (days) setValue(`subjects.${index}.study_days`, days);
  }

  function changeDays(index: number, days: Weekday[]) {
    setValue(`subjects.${index}.study_days`, days);
    setValue(`subjects.${index}.preset`, "custom");
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Choose how long each study session is and which days you study each subject. Higher
        priority subjects keep their sessions when a day gets too full.
      </p>

      <ul className="flex flex-col gap-3">
        {subjects.map((subject, i) => (
          <li key={i} className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <h2 className="min-w-0 truncate font-medium">{subject.name}</h2>
              <span className="text-xs text-muted-foreground">{subject.level}</span>
            </div>

            <Controller
              name={`subjects.${i}.session_minutes`}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={`session-${i}`}>Session length</FieldLabel>
                  <Select<number>
                    value={field.value}
                    onValueChange={(minutes) => minutes !== null && field.onChange(minutes)}
                  >
                    <SelectTrigger id={`session-${i}`} className="w-40">
                      <SelectValue>{(minutes: number) => formatMinutes(minutes)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_LENGTHS.map((minutes) => (
                        <SelectItem key={minutes} value={minutes}>
                          {formatMinutes(minutes)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Field>
              <FieldLabel>How often</FieldLabel>
              <ChoiceButtons
                label="How often"
                options={FREQUENCY_PRESETS}
                labels={FREQUENCY_LABELS}
                value={subject.preset}
                onChange={(preset) => choosePreset(i, preset)}
              />
              <DayChips
                label={`Study days for ${subject.name}`}
                value={subject.study_days}
                onChange={(days) => changeDays(i, days)}
                color={subject.color}
              />
              {subject.study_days.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No regular sessions. Exam prep will still be scheduled before this subject&apos;s
                  exams.
                </p>
              )}
            </Field>

            <Controller
              name={`subjects.${i}.priority`}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Priority</FieldLabel>
                  <ChoiceButtons
                    label="Priority"
                    options={PRIORITIES}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </Field>
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
