"use client";

// Profile settings: name, graduation year, diploma student, daily study limit.
// Edits stay in the card until Save; only changed fields are sent (updateProfile).
// Imports: @/components/providers/DataProvider, @/components/onboarding/schema (DAILY_LIMITS)

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Path, type PathValue } from "react-hook-form";
import { DAILY_LIMITS } from "@/components/onboarding/schema";
import { useData } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
import { formatMinutes } from "@/lib/utils";
import type { Profile } from "@/types";
import { changedFields, profileFormSchema, type ProfileFormValues } from "./schema";

function toForm(p: Profile): ProfileFormValues {
  return {
    name: p.name,
    graduation_year: p.graduation_year,
    diploma: p.diploma,
    daily_cap_minutes: p.daily_cap_minutes,
  };
}

export function ProfileSettings() {
  const { profile, updateProfile } = useData();
  const today = useToday();

  const saved = toForm(profile);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: saved,
  });
  const values: ProfileFormValues = { ...saved, ...useWatch({ control: form.control }) };
  const { isDirty, errors } = form.formState;

  // Follow the saved profile (e.g. a failed save being undone) unless mid-edit
  useEffect(() => {
    if (!isDirty) form.reset(toForm(profile));
  }, [profile, isDirty, form]);

  function set<K extends Path<ProfileFormValues>>(key: K, value: PathValue<ProfileFormValues, K>) {
    form.setValue(key, value, { shouldDirty: true, shouldValidate: key in errors });
  }

  function save(formValues: ProfileFormValues) {
    const changes = changedFields(saved, formValues);
    if (Object.keys(changes).length > 0) updateProfile(changes);
    form.reset(formValues);
  }

  // This year to three years ahead, plus the saved year if it's outside that range
  const thisYear = today ? Number(today.slice(0, 4)) : profile.graduation_year;
  const years = [...new Set([0, 1, 2, 3].map((n) => thisYear + n).concat(profile.graduation_year))].sort((a, b) => a - b);

  return (
    <form onSubmit={form.handleSubmit(save)} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="settings-name">Name</FieldLabel>
          <Input
            id="settings-name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => form.trigger("name")}
            autoComplete="given-name"
            aria-invalid={!!errors.name}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="settings-year">Graduation year</FieldLabel>
            <Select<number>
              value={values.graduation_year}
              onValueChange={(year) => year !== null && set("graduation_year", year)}
            >
              <SelectTrigger id="settings-year" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="settings-limit">Daily study limit</FieldLabel>
            <Select<number>
              value={values.daily_cap_minutes}
              onValueChange={(minutes) => minutes !== null && set("daily_cap_minutes", minutes)}
            >
              <SelectTrigger id="settings-limit" className="w-full">
                <SelectValue>{(minutes: number) => formatMinutes(minutes)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DAILY_LIMITS.map((minutes) => (
                  <SelectItem key={minutes} value={minutes}>
                    {formatMinutes(minutes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel>Full IB Diploma student</FieldLabel>
          <FieldDescription>
            Diploma students take 6 subjects (3 or 4 at HL) plus the EE, TOK, and CAS.
          </FieldDescription>
          <RadioGroup
            value={values.diploma}
            onValueChange={(value) => set("diploma", value === true)}
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
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        {isDirty && (
          <Button type="button" variant="outline" onClick={() => form.reset(saved)}>
            Discard changes
          </Button>
        )}
        <Button type="submit" disabled={!isDirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
