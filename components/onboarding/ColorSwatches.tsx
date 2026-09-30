"use client";

// Subject color picker: a round button showing the current color that opens the palette.
// Used by: components/onboarding/SubjectPicker, components/settings/SubjectSettingsCard

import { useState } from "react";
import { SUBJECT_COLORS } from "@/constants";
import { cn } from "@/lib/utils";

interface ColorSwatchesProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorSwatches({ value, onChange, className }: ColorSwatchesProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Change color"
        className="size-8 shrink-0 rounded-full ring-2 ring-card outline-none ring-offset-1 focus-visible:ring-ring"
        style={{ backgroundColor: value }}
      />
      {open && (
        <div role="group" aria-label="Subject color" className="flex flex-wrap gap-2">
          {SUBJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={value === c}
              aria-label={`Color ${c}`}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className={cn(
                "size-7 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                value === c && "ring-2 ring-foreground ring-offset-2"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
