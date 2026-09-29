// Card: subject name, HL/SL, predicted grade, study plan (session length, days, priority), link to detail page.
// Days read "Weekends" when they match the student's weekend_days.
// Used by: app/(app)/subjects/page.tsx

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { describeStudyDays } from "@/lib/utils";
import type { Subject, Weekday } from "@/types";

interface SubjectCardProps {
  subject: Subject;
  /** The student's weekend_days, for the "Weekends" label */
  weekendDays: Weekday[];
}

export function SubjectCard({ subject, weekendDays }: SubjectCardProps) {
  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="group flex flex-col gap-4 rounded-xl border-t-4 bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      style={{ borderTopColor: subject.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-medium group-hover:underline">{subject.name}</h2>
        <Badge variant="outline">{subject.level}</Badge>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Predicted grade</p>
          <p className="text-2xl font-semibold">{subject.predicted_grade ?? "–"}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 text-right">
          <Badge variant="secondary">{subject.priority} priority</Badge>
          <p className="text-xs text-muted-foreground">
            {subject.session_minutes} min · {describeStudyDays(subject.study_days, weekendDays)}
          </p>
        </div>
      </div>
    </Link>
  );
}
