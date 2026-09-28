// Past assessment results with score bars, newest first.
// Used by: subjects/[subjectId]

import { formatDueDate } from "@/lib/utils";
import type { Assessment } from "@/types";

interface AssessmentListProps {
  assessments: Assessment[];
  /** Subject color for the score bars */
  color: string;
}

export function AssessmentList({ assessments, color }: AssessmentListProps) {
  if (assessments.length === 0) {
    return <p className="text-sm text-muted-foreground">No assessments yet.</p>;
  }

  const newestFirst = [...assessments].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ul className="flex flex-col gap-4">
      {newestFirst.map((assessment) => {
        const percent = Math.round((assessment.score / assessment.max_score) * 100);
        return (
          <li key={assessment.id} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium">{assessment.name}</p>
              <p className="shrink-0 text-sm">
                {assessment.score}/{assessment.max_score}
                <span className="ml-2 text-muted-foreground">{percent}%</span>
              </p>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-surface"
              role="img"
              aria-label={`${percent}%`}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{formatDueDate(assessment.date)}</p>
          </li>
        );
      })}
    </ul>
  );
}
