// Today's study sessions: which subjects to study and for how long, from the study plan.
// Placeholder until the scheduling algorithm (lib/study-plan.ts) is built.
// Imports: @/lib/study-plan (getDailyTargets). Used by: dashboard

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TodayPlan() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s plan</CardTitle>
        <CardDescription>Which subjects to study today, and for how long.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Your study sessions will show here once the study plan is ready.
        </p>
      </CardContent>
    </Card>
  );
}
