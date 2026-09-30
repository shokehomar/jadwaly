"use client";

// A subject's name (with IB suggestions), HL/SL, and color, plus an optional remove button.
// Render <SubjectNameSuggestions /> once on the page for the name suggestions.
// Used by: components/onboarding/SubjectPicker, components/settings/SubjectSettingsCard

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IB_SUBJECTS } from "@/constants";
import { ChoiceButtons } from "./ChoiceButtons";
import { ColorSwatches } from "./ColorSwatches";

const SUGGESTIONS_ID = "ib-subject-suggestions";

export function SubjectNameSuggestions() {
  return (
    <datalist id={SUGGESTIONS_ID}>
      {IB_SUBJECTS.flatMap((group) => group.subjects).map((name) => (
        <option key={name} value={name} />
      ))}
    </datalist>
  );
}

interface SubjectFieldsProps {
  /** Unique per subject, for input ids */
  idPrefix: string;
  name: string;
  onNameChange: (name: string) => void;
  onNameBlur?: () => void;
  nameError?: string;
  level: "HL" | "SL";
  onLevelChange: (level: "HL" | "SL") => void;
  color: string;
  onColorChange: (color: string) => void;
  /** Shows a remove (trash) button when given */
  onRemove?: () => void;
  removeLabel?: string;
}

export function SubjectFields({
  idPrefix,
  name,
  onNameChange,
  onNameBlur,
  nameError,
  level,
  onLevelChange,
  color,
  onColorChange,
  onRemove,
  removeLabel = "Remove subject",
}: SubjectFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Field data-invalid={!!nameError} className="min-w-0 flex-1">
          <FieldLabel htmlFor={`${idPrefix}-name`}>Subject</FieldLabel>
          <Input
            id={`${idPrefix}-name`}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={onNameBlur}
            list={SUGGESTIONS_ID}
            placeholder="e.g. Physics"
            autoComplete="off"
            aria-invalid={!!nameError}
          />
          <FieldError errors={nameError ? [{ message: nameError }] : []} />
        </Field>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6"
            aria-label={removeLabel}
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
        <Field className="w-auto">
          <FieldLabel>Level</FieldLabel>
          <ChoiceButtons
            label="Level"
            options={["HL", "SL"] as const}
            value={level}
            onChange={onLevelChange}
          />
        </Field>
        <Field className="w-auto">
          <FieldLabel>Color</FieldLabel>
          <ColorSwatches value={color} onChange={onColorChange} />
        </Field>
      </div>
    </div>
  );
}
