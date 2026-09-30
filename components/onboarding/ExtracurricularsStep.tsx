"use client";

// Step 4 (optional): extracurriculars, each with name, days, start time, and duration.
// Used by: app/onboarding/page.tsx

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMinutes } from "@/lib/utils";
import { DayChips } from "./DayChips";
import { DURATIONS, type OnboardingValues } from "./schema";

export function ExtracurricularsStep() {
  const { control } = useFormContext<OnboardingValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "extracurriculars" });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Add regular commitments like sports, clubs, or a job. This step is optional.
      </p>

      <ul className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <li key={field.id} className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-start gap-3">
              <Controller
                name={`extracurriculars.${i}.name`}
                control={control}
                render={({ field: name, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="min-w-0 flex-1">
                    <FieldLabel htmlFor={`activity-name-${field.id}`}>Name</FieldLabel>
                    <Input
                      {...name}
                      id={`activity-name-${field.id}`}
                      placeholder="e.g. Gym"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
                aria-label="Remove"
                onClick={() => remove(i)}
              >
                <Trash2 />
              </Button>
            </div>

            <Controller
              name={`extracurriculars.${i}.days`}
              control={control}
              render={({ field: days, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Days</FieldLabel>
                  <DayChips
                    label="Days"
                    value={days.value}
                    onChange={days.onChange}
                    invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name={`extracurriculars.${i}.start_time`}
                control={control}
                render={({ field: time, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`activity-time-${field.id}`}>Start time</FieldLabel>
                    <Input
                      {...time}
                      id={`activity-time-${field.id}`}
                      type="time"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name={`extracurriculars.${i}.duration_minutes`}
                control={control}
                render={({ field: duration }) => (
                  <Field>
                    <FieldLabel htmlFor={`activity-duration-${field.id}`}>Duration</FieldLabel>
                    <Select<number>
                      value={duration.value}
                      onValueChange={(minutes) => minutes !== null && duration.onChange(minutes)}
                    >
                      <SelectTrigger id={`activity-duration-${field.id}`} className="w-full">
                        <SelectValue>{(minutes: number) => formatMinutes(minutes)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((minutes) => (
                          <SelectItem key={minutes} value={minutes}>
                            {formatMinutes(minutes)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>
          </li>
        ))}
      </ul>

      {fields.length === 0 && (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No extracurriculars. You can skip this step.
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => append({ name: "", days: [], start_time: "17:00", duration_minutes: 60 })}
      >
        <Plus data-icon="inline-start" />
        Add extracurricular
      </Button>
    </div>
  );
}
