"use client";

// Subjects section of Settings: the onboarding rules as warnings (not blocking), one
// card per subject, and adding a subject.
// Imports: ./SubjectSettingsCard, ./schema (subjectWarnings), @/components/providers/DataProvider

import { useState } from "react";
import { Plus, TriangleAlert } from "lucide-react";
import { SubjectNameSuggestions } from "@/components/onboarding/SubjectFields";
import { useData } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/button";
import { newSubjectDefaults, subjectWarnings, type SubjectFormValues } from "./schema";
import { SubjectSettingsCard } from "./SubjectSettingsCard";

export function SubjectSettings() {
  const { profile, subjects } = useData();
  // Defaults for the "add subject" card while it's open
  const [adding, setAdding] = useState<SubjectFormValues | null>(null);

  const warnings = subjectWarnings(profile.diploma, subjects);

  return (
    <div className="flex flex-col gap-4">
      <SubjectNameSuggestions />

      {warnings.length > 0 && (
        <div
          role="status"
          className="flex gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <ul className="flex flex-col gap-1">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {subjects.map((subject) => (
          <li key={subject.id}>
            <SubjectSettingsCard subject={subject} />
          </li>
        ))}
      </ul>

      {adding ? (
        <SubjectSettingsCard defaults={adding} onClose={() => setAdding(null)} />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => setAdding(newSubjectDefaults(subjects))}
        >
          <Plus data-icon="inline-start" />
          Add subject
        </Button>
      )}
    </div>
  );
}
