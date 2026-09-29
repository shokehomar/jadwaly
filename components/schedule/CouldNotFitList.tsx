// Sessions the scheduler couldn't place this week, with the day they came from and why.
// Renders nothing when the list is empty.
// Used by: app/(app)/schedule

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDueDate } from "@/lib/utils";
import type { Subject, UnscheduledSession } from "@/types";

const CAUSE_LABEL: Record<UnscheduledSession["cause"], string> = {
  missed: "Missed",
  "over cap": "Day was over your daily limit",
};

interface CouldNotFitListProps {
  items: UnscheduledSession[];
  subjects: Subject[];
}

export function CouldNotFitList({ items, subjects }: CouldNotFitListProps) {
  if (items.length === 0) return null;

  return (
    <Card className="ring-destructive/30">
      <CardHeader>
        <CardTitle>Couldn&apos;t fit this week</CardTitle>
        <CardDescription>
          There was no room left before Sunday for these sessions. Study them if you can, or
          adjust your study plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => {
            const subject = subjects.find((s) => s.id === item.subjectId);
            return (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full bg-border"
                  style={subject ? { backgroundColor: subject.color } : undefined}
                />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{subject?.name ?? "Unknown subject"}</span>
                  <span className="text-muted-foreground">, {item.minutes} min</span>
                  <span className="block text-xs text-muted-foreground">
                    From {formatDueDate(item.fromDate)} · {CAUSE_LABEL[item.cause]}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
