"use client";

// One extracurricular in Settings: name, days, start time, duration. Edits stay in the
// card until Save; only changed fields are sent. Without `extracurricular` it's the
// form for adding a new one. Delete asks for confirmation.
// Imports: @/components/onboarding (DayChips, schema), @/components/providers/DataProvider

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Path, type PathValue } from "react-hook-form";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { DayChips } from "@/components/onboarding/DayChips";
import {
  DURATIONS,
  extracurricularSchema,
  type OnboardingExtracurricular,
} from "@/components/onboarding/schema";
import { useData } from "@/components/providers/DataProvider";
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
import type { Extracurricular } from "@/types";
import { changedFields } from "./schema";

type FormValues = OnboardingExtracurricular;

const NEW_EXTRACURRICULAR: FormValues = {
  name: "",
  days: [],
  start_time: "17:00",
  duration_minutes: 60,
};

function toForm(e: Extracurricular): FormValues {
  return { name: e.name, days: e.days, start_time: e.start_time, duration_minutes: e.duration_minutes };
}

interface ExtracurricularSettingsCardProps {
  /** The saved extracurricular; leave out to add a new one */
  extracurricular?: Extracurricular;
  /** Called after a new one is added, or adding is cancelled */
  onClose?: () => void;
}

export function ExtracurricularSettingsCard({
  extracurricular,
  onClose,
}: ExtracurricularSettingsCardProps) {
  const { addExtracurricular, updateExtracurricular, deleteExtracurricular } = useData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const saved = extracurricular ? toForm(extracurricular) : undefined;
  const initial = saved ?? NEW_EXTRACURRICULAR;
  const form = useForm<FormValues>({
    resolver: zodResolver(extracurricularSchema),
    defaultValues: initial,
  });
  const values: FormValues = { ...initial, ...useWatch({ control: form.control }) };
  const { isDirty, errors } = form.formState;

  // Follow the saved row (e.g. a failed save being undone) unless mid-edit
  useEffect(() => {
    if (extracurricular && !isDirty) form.reset(toForm(extracurricular));
  }, [extracurricular, isDirty, form]);

  function set<K extends Path<FormValues>>(key: K, value: PathValue<FormValues, K>) {
    form.setValue(key, value, { shouldDirty: true, shouldValidate: key in errors });
  }

  function save(formValues: FormValues) {
    if (extracurricular) {
      const changes = changedFields(extracurricular, formValues);
      if (Object.keys(changes).length > 0) updateExtracurricular(extracurricular.id, changes);
      form.reset(formValues);
    } else {
      addExtracurricular(formValues);
      onClose?.();
    }
  }

  const idPrefix = `settings-activity-${extracurricular?.id ?? "new"}`;

  return (
    <form
      onSubmit={form.handleSubmit(save)}
      noValidate
      className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
    >
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor={`${idPrefix}-name`}>Name</FieldLabel>
        <Input
          id={`${idPrefix}-name`}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          onBlur={() => form.trigger("name")}
          placeholder="e.g. Gym"
          aria-invalid={!!errors.name}
        />
        <FieldError errors={[errors.name]} />
      </Field>

      <Field data-invalid={!!errors.days}>
        <FieldLabel>Days</FieldLabel>
        <DayChips
          label="Days"
          value={values.days}
          onChange={(days) => set("days", days)}
          invalid={!!errors.days}
        />
        <FieldError errors={[errors.days]} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!errors.start_time}>
          <FieldLabel htmlFor={`${idPrefix}-time`}>Start time</FieldLabel>
          <Input
            id={`${idPrefix}-time`}
            type="time"
            value={values.start_time}
            onChange={(e) => set("start_time", e.target.value)}
            aria-invalid={!!errors.start_time}
          />
          <FieldError errors={[errors.start_time]} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-duration`}>Duration</FieldLabel>
          <Select<number>
            value={values.duration_minutes}
            onValueChange={(minutes) => minutes !== null && set("duration_minutes", minutes)}
          >
            <SelectTrigger id={`${idPrefix}-duration`} className="w-full">
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
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center">
        {extracurricular ? (
          <>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive sm:mr-auto"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </Button>
            {isDirty && (
              <Button type="button" variant="outline" onClick={() => form.reset(saved)}>
                Discard changes
              </Button>
            )}
            <Button type="submit" disabled={!isDirty}>
              Save changes
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" className="sm:ml-auto" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add extracurricular</Button>
          </>
        )}
      </div>

      {extracurricular && (
        <ConfirmDialog
          open={confirmingDelete}
          onOpenChange={setConfirmingDelete}
          title={`Delete ${extracurricular.name}?`}
          description="It will be removed from your schedule. This can't be undone."
          confirmLabel="Delete"
          onConfirm={() => deleteExtracurricular(extracurricular.id)}
        />
      )}
    </form>
  );
}
