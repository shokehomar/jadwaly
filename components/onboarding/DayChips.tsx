// Weekday toggle chips, Monday first. Value is a list of Weekday numbers (0 = Sunday).
// Used by: components/onboarding/StudyPlanForm, components/onboarding/ExtracurricularsStep

import { WEEK_ORDER, WEEKDAYS } from "@/constants";
import { cn } from "@/lib/utils";
import type { Weekday } from "@/types";

interface DayChipsProps {
  value: Weekday[];
  onChange: (days: Weekday[]) => void;
  /** Chip color when selected; defaults to the primary color */
  color?: string;
  invalid?: boolean;
  label: string;
}

export function DayChips({ value, onChange, color, invalid, label }: DayChipsProps) {
  function toggle(day: Weekday) {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day];
    onChange(next.sort((a, b) => a - b));
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {WEEK_ORDER.map((day) => {
        const selected = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            aria-pressed={selected}
            aria-label={WEEKDAYS[day].long}
            onClick={() => toggle(day)}
            className={cn(
              "h-8 min-w-11 rounded-md px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground hover:bg-accent",
              invalid && !selected && "ring-1 ring-destructive/50"
            )}
            style={selected && color ? { backgroundColor: color } : undefined}
          >
            {WEEKDAYS[day].short}
          </button>
        );
      })}
    </div>
  );
}
