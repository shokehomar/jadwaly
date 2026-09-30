"use client";

// Extracurriculars section of Settings: one card per extracurricular, and adding one.
// Imports: ./ExtracurricularSettingsCard, @/components/providers/DataProvider

import { useState } from "react";
import { Plus } from "lucide-react";
import { useData } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/button";
import { ExtracurricularSettingsCard } from "./ExtracurricularSettingsCard";

export function ExtracurricularSettings() {
  const { extracurriculars } = useData();
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {extracurriculars.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">No extracurriculars.</p>
      )}

      <ul className="flex flex-col gap-3">
        {extracurriculars.map((e) => (
          <li key={e.id}>
            <ExtracurricularSettingsCard extracurricular={e} />
          </li>
        ))}
      </ul>

      {adding ? (
        <ExtracurricularSettingsCard onClose={() => setAdding(false)} />
      ) : (
        <Button type="button" variant="outline" className="self-start" onClick={() => setAdding(true)}>
          <Plus data-icon="inline-start" />
          Add extracurricular
        </Button>
      )}
    </div>
  );
}
