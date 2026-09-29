// A small row of mutually exclusive buttons (e.g. HL/SL, priority, frequency preset).
// Used by: components/onboarding/SubjectPicker, components/onboarding/StudyPlanForm

import { cn } from "@/lib/utils";

interface ChoiceButtonsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  labels?: Partial<Record<T, string>>;
}

export function ChoiceButtons<T extends string>({
  options,
  value,
  onChange,
  label,
  labels,
}: ChoiceButtonsProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={cn(
              "h-8 rounded-md px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "bg-accent text-accent-foreground ring-1 ring-primary"
                : "bg-surface text-muted-foreground hover:bg-accent"
            )}
          >
            {labels?.[option] ?? option}
          </button>
        );
      })}
    </div>
  );
}
