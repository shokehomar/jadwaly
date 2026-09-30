"use client";

// Step 2: add subjects with name (IB suggestions), HL/SL, and color (auto-assigned, editable).
// Diploma: exactly 6 subjects, 3 or 4 at HL. Non-diploma: any number from 1.
// Imports: ./SubjectFields. Used by: app/onboarding/page.tsx

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectFields, SubjectNameSuggestions } from "./SubjectFields";
import { newSubject, type OnboardingValues } from "./schema";

export function SubjectPicker() {
  const { control, getValues, setValue, trigger, formState } = useFormContext<OnboardingValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "subjects" });
  const diploma = useWatch({ control, name: "diploma" });
  const subjects = useWatch({ control, name: "subjects" });

  const hlCount = subjects.filter((s) => s.level === "HL").length;
  const listError = formState.errors.subjects?.root?.message ?? formState.errors.subjects?.message;
  const diplomaFull = diploma === true && fields.length >= 6;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {diploma
          ? "Add your 6 subjects. 3 or 4 of them are at HL."
          : "Add each IB subject you take."}{" "}
        {fields.length > 0 && (
          <span className="font-medium text-foreground">
            {fields.length} {fields.length === 1 ? "subject" : "subjects"}, {hlCount} HL
          </span>
        )}
      </p>

      <SubjectNameSuggestions />

      <ul className="flex flex-col gap-3">
        {fields.map((field, i) => {
          const subject = subjects[i] ?? field;
          const nameError = formState.errors.subjects?.[i]?.name?.message;
          return (
            <li key={field.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <SubjectFields
                idPrefix={`subject-${field.id}`}
                name={subject.name}
                onNameChange={(name) =>
                  setValue(`subjects.${i}.name`, name, { shouldValidate: !!nameError })
                }
                onNameBlur={() => trigger(`subjects.${i}.name`)}
                nameError={nameError}
                level={subject.level}
                onLevelChange={(level) => setValue(`subjects.${i}.level`, level)}
                color={subject.color}
                onColorChange={(color) => setValue(`subjects.${i}.color`, color)}
                onRemove={() => remove(i)}
              />
            </li>
          );
        })}
      </ul>

      {fields.length === 0 && (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No subjects yet.
        </p>
      )}

      {listError && (
        <p role="alert" className="text-sm text-destructive">
          {listError}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        className="self-start"
        disabled={diplomaFull}
        onClick={() => append(newSubject(getValues("subjects")))}
      >
        <Plus data-icon="inline-start" />
        Add subject
      </Button>
    </div>
  );
}
