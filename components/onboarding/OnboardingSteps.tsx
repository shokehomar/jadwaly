// Step indicator + next/back controls for onboarding, wrapped around the current step.
// Used by: app/onboarding/page.tsx

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface OnboardingStepsProps {
  step: number;
  titles: readonly string[];
  onBack: () => void;
  onNext: () => void;
  /** Saving: disables the buttons and shows "Saving…" */
  busy?: boolean;
  children: React.ReactNode;
}

export function OnboardingSteps({
  step,
  titles,
  onBack,
  onNext,
  busy = false,
  children,
}: OnboardingStepsProps) {
  const isLast = step === titles.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {titles.length}
        </p>
        <h1 className="text-2xl font-semibold">{titles[step]}</h1>
        <Progress
          value={((step + 1) / titles.length) * 100}
          aria-label="Onboarding progress"
          className="[&_[data-slot=progress-track]]:bg-border"
        />
      </div>

      {children}

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        {step > 0 ? (
          <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={busy}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button type="button" size="lg" onClick={onNext} disabled={busy}>
          {busy ? "Saving…" : isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
