"use client";

// One subject in Settings: name, level, color, and study plan (session length, days,
// priority). Edits stay in this card until Save; only changed fields are sent.
// Without `subject` it's the form for adding a new one. Delete asks for confirmation,
// since the subject's assessments and study logs go with it.
// Imports: @/components/onboarding (SubjectFields, StudyPlanControls), @/components/providers/DataProvider

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Path, type PathValue } from "react-hook-form";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { presetDays, subjectSchema, everyOtherDaySetFor } from "@/components/onboarding/schema";
import { StudyPlanControls, type StudyPlanValue } from "@/components/onboarding/StudyPlanControls";
import { SubjectFields } from "@/components/onboarding/SubjectFields";
import { useData } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/button";
import type { Subject } from "@/types";
import {
  changedFields,
  newSubjectDefaults,
  subjectToForm,
  type SubjectFormValues,
} from "./schema";

interface SubjectSettingsCardProps {
  /** The saved subject; leave out to add a new one */
  subject?: Subject;
  /** Starting values for a new subject */
  defaults?: SubjectFormValues;
  /** Called after a new subject is added, or adding is cancelled */
  onClose?: () => void;
}

export function SubjectSettingsCard({ subject, defaults, onClose }: SubjectSettingsCardProps) {
  const { profile, subjects, assessments, studyLogs, addSubject, updateSubject, deleteSubject } =
    useData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const saved = subject ? subjectToForm(subject, profile.weekend_days) : undefined;
  const initial = saved ?? defaults ?? newSubjectDefaults(subjects);
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: initial,
  });
  const values: SubjectFormValues = { ...initial, ...useWatch({ control: form.control }) };
  const { isDirty, errors } = form.formState;

  // Follow the saved subject (e.g. a failed save being undone) unless mid-edit
  useEffect(() => {
    if (subject && !isDirty) form.reset(subjectToForm(subject, profile.weekend_days));
  }, [subject, profile.weekend_days, isDirty, form]);

  const others = subjects.filter((s) => s.id !== subject?.id);

  function set<K extends Path<SubjectFormValues>>(key: K, value: PathValue<SubjectFormValues, K>) {
    form.setValue(key, value, { shouldDirty: true, shouldValidate: key in errors });
  }

  function changePlan(changes: Partial<StudyPlanValue>) {
    if (changes.session_minutes !== undefined) set("session_minutes", changes.session_minutes);
    if (changes.preset !== undefined) set("preset", changes.preset);
    if (changes.study_days !== undefined) set("study_days", changes.study_days);
    if (changes.priority !== undefined) set("priority", changes.priority);
  }

  function save(formValues: SubjectFormValues) {
    const row = {
      name: formValues.name,
      level: formValues.level,
      color: formValues.color,
      session_minutes: formValues.session_minutes,
      study_days: formValues.study_days,
      priority: formValues.priority,
    };
    if (subject) {
      const changes = changedFields(subject, row);
      if (Object.keys(changes).length > 0) updateSubject(subject.id, changes);
      form.reset(formValues);
    } else {
      addSubject({ ...row, predicted_grade: null });
      onClose?.();
    }
  }

  const idPrefix = `settings-subject-${subject?.id ?? "new"}`;
  const assessmentCount = assessments.filter((a) => a.subject_id === subject?.id).length;
  const logCount = studyLogs.filter((l) => l.subject_id === subject?.id).length;

  return (
    <form
      onSubmit={form.handleSubmit(save)}
      noValidate
      className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
    >
      <SubjectFields
        idPrefix={idPrefix}
        name={values.name}
        onNameChange={(name) => set("name", name)}
        onNameBlur={() => form.trigger("name")}
        nameError={errors.name?.message}
        level={values.level}
        onLevelChange={(level) => set("level", level)}
        color={values.color}
        onColorChange={(color) => set("color", color)}
      />

      <StudyPlanControls
        idPrefix={idPrefix}
        subjectName={values.name}
        color={values.color}
        value={values}
        onChange={changePlan}
        daysForPreset={(preset) =>
          preset === "every other day"
            ? everyOtherDaySetFor(others.map((s) => s.study_days))
            : presetDays(preset, 0, profile.weekend_days)
        }
      />

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center">
        {subject ? (
          <>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive sm:mr-auto"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete subject
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
            <Button type="submit">Add subject</Button>
          </>
        )}
      </div>

      {subject && (
        <ConfirmDialog
          open={confirmingDelete}
          onOpenChange={setConfirmingDelete}
          title={`Delete ${subject.name}?`}
          description={
            <>
              Its assessments ({assessmentCount}) and study logs ({logCount}) will be deleted too.
              Its tasks are kept, without a subject. This can&apos;t be undone.
            </>
          }
          confirmLabel="Delete subject"
          onConfirm={() => deleteSubject(subject.id)}
        />
      )}
    </form>
  );
}
