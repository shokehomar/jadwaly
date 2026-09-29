"use client";

// Step 2: add subjects with name (IB suggestions), HL/SL, and color (auto-assigned, editable).
// Diploma: exactly 6 subjects, 3 or 4 at HL. Non-diploma: any number from 1.
// Imports: @/constants (IB_SUBJECTS, SUBJECT_COLORS). Used by: app/onboarding/page.tsx

import { useState } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IB_SUBJECTS, SUBJECT_COLORS } from "@/constants";
import { cn } from "@/lib/utils";
import { ChoiceButtons } from "./ChoiceButtons";
import { newSubject, type OnboardingValues } from "./schema";

const SUGGESTIONS_ID = "ib-subject-suggestions";

export function SubjectPicker() {
  const { control, getValues, formState } = useFormContext<OnboardingValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "subjects" });
  const diploma = useWatch({ control, name: "diploma" });
  const subjects = useWatch({ control, name: "subjects" });
  const [openPalette, setOpenPalette] = useState<string | null>(null);

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

      <datalist id={SUGGESTIONS_ID}>
        {IB_SUBJECTS.flatMap((group) => group.subjects).map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <ul className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <li key={field.id} className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-start gap-3">
              <Controller
                name={`subjects.${i}.color`}
                control={control}
                render={({ field: color }) => (
                  <button
                    type="button"
                    onClick={() => setOpenPalette(openPalette === field.id ? null : field.id)}
                    aria-expanded={openPalette === field.id}
                    aria-label="Change color"
                    className="mt-7 size-8 shrink-0 rounded-full ring-2 ring-card outline-none ring-offset-1 focus-visible:ring-ring"
                    style={{ backgroundColor: color.value }}
                  />
                )}
              />

              <Controller
                name={`subjects.${i}.name`}
                control={control}
                render={({ field: name, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="min-w-0 flex-1">
                    <FieldLabel htmlFor={`subject-name-${field.id}`}>Subject</FieldLabel>
                    <Input
                      {...name}
                      id={`subject-name-${field.id}`}
                      list={SUGGESTIONS_ID}
                      placeholder="e.g. Physics"
                      autoComplete="off"
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
                aria-label="Remove subject"
                onClick={() => remove(i)}
              >
                <Trash2 />
              </Button>
            </div>

            {openPalette === field.id && (
              <Controller
                name={`subjects.${i}.color`}
                control={control}
                render={({ field: color }) => (
                  <div role="group" aria-label="Subject color" className="flex flex-wrap gap-2">
                    {SUBJECT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={color.value === c}
                        aria-label={`Color ${c}`}
                        onClick={() => {
                          color.onChange(c);
                          setOpenPalette(null);
                        }}
                        className={cn(
                          "size-7 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          color.value === c && "ring-2 ring-foreground ring-offset-2"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
              />
            )}

            <Controller
              name={`subjects.${i}.level`}
              control={control}
              render={({ field: level }) => (
                <ChoiceButtons
                  label="Level"
                  options={["HL", "SL"] as const}
                  value={level.value}
                  onChange={level.onChange}
                />
              )}
            />
          </li>
        ))}
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
