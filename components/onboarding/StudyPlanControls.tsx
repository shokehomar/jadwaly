"use client";

// Study plan controls for one subject: session length, frequency preset, day chips,
// and priority. Choosing a preset fills the days (via daysForPreset); editing a day
// chip switches the preset to Custom. Shows a note when no days are chosen.
// Used by: components/onboarding/StudyPlanForm, components/settings/SubjectSettingsCard

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
import type { Priority, Weekday } from "@/types";
import { ChoiceButtons } from "./ChoiceButtons";
import { DayChips } from "./DayChips";
import {
  FREQUENCY_LABELS,
  FREQUENCY_PRESETS,
  SESSION_LENGTHS,
  type FrequencyPreset,
} from "./schema";

export interface StudyPlanValue {
  session_minutes: number;
  preset: FrequencyPreset;
  study_days: Weekday[];
  priority: Priority;
}

interface StudyPlanControlsProps {
  /** Unique per subject, for input ids */
  idPrefix: string;
  subjectName: string;
  color: string;
  value: StudyPlanValue;
  onChange: (changes: Partial<StudyPlanValue>) => void;
  /** Days for a preset; null keeps the current days (Custom) */
  daysForPreset: (preset: FrequencyPreset) => Weekday[] | null;
}

export function StudyPlanControls({
  idPrefix,
  subjectName,
  color,
  value,
  onChange,
  daysForPreset,
}: StudyPlanControlsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-session`}>Session length</FieldLabel>
        <Select<number>
          value={value.session_minutes}
          onValueChange={(minutes) => minutes !== null && onChange({ session_minutes: minutes })}
        >
          <SelectTrigger id={`${idPrefix}-session`} className="w-40">
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

      <Field>
        <FieldLabel>How often</FieldLabel>
        <ChoiceButtons
          label="How often"
          options={FREQUENCY_PRESETS}
          labels={FREQUENCY_LABELS}
          value={value.preset}
          onChange={(preset) =>
            onChange({ preset, study_days: daysForPreset(preset) ?? value.study_days })
          }
        />
        <DayChips
          label={`Study days for ${subjectName || "this subject"}`}
          value={value.study_days}
          onChange={(days) => onChange({ study_days: days, preset: "custom" })}
          color={color}
        />
        {value.study_days.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No regular sessions. Exam prep will still be scheduled before this subject&apos;s exams.
          </p>
        )}
      </Field>

      <Field>
        <FieldLabel>Priority</FieldLabel>
        <ChoiceButtons
          label="Priority"
          options={PRIORITIES}
          value={value.priority}
          onChange={(priority) => onChange({ priority })}
        />
      </Field>
    </>
  );
}
