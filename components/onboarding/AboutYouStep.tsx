"use client";

// Step 1: name, graduation year, diploma student (yes/no).
// Used by: app/onboarding/page.tsx

import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToday } from "@/hooks/use-today";
import type { OnboardingValues } from "./schema";

export function AboutYouStep() {
  const { control } = useFormContext<OnboardingValues>();
  const today = useToday();
  const thisYear = today ? Number(today.slice(0, 4)) : null;
  const years = thisYear ? [0, 1, 2, 3].map((n) => thisYear + n) : [];

  return (
    <FieldGroup>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="onboarding-name">Your name</FieldLabel>
            <Input {...field} id="onboarding-name" autoComplete="given-name" aria-invalid={fieldState.invalid} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="graduation_year"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="onboarding-year">Graduation year</FieldLabel>
            <Select<number>
              value={field.value ?? null}
              onValueChange={(year) => year !== null && field.onChange(year)}
            >
              <SelectTrigger
                id="onboarding-year"
                className="w-40"
                aria-invalid={fieldState.invalid}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder="Choose a year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="diploma"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Are you a full IB Diploma student?</FieldLabel>
            <FieldDescription>
              Diploma students take 6 subjects plus the EE, TOK, and CAS. Choose No if you take
              separate IB courses.
            </FieldDescription>
            <RadioGroup
              value={field.value ?? null}
              onValueChange={(value) => field.onChange(value === true)}
              aria-invalid={fieldState.invalid}
              className="flex gap-6"
            >
              <Label className="flex items-center gap-2 font-normal">
                <RadioGroupItem value={true} />
                Yes
              </Label>
              <Label className="flex items-center gap-2 font-normal">
                <RadioGroupItem value={false} />
                No
              </Label>
            </RadioGroup>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </FieldGroup>
  );
}
