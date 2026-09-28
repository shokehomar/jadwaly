"use client";

// Vertical timeline of milestones with date + status (reused for IA, EE, TOK).
// Milestones are regular tasks, ordered by due date. Click one to edit it.
// Used by: subjects/[subjectId], ee, tok

import { useState } from "react";
import { Check } from "lucide-react";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { cn, byDueDate, formatDueDate, isOverdue } from "@/lib/utils";
import type { Task } from "@/types";

interface MilestoneTimelineProps {
  milestones: Task[];
  emptyText?: string;
}

export function MilestoneTimeline({
  milestones,
  emptyText = "No milestones yet.",
}: MilestoneTimelineProps) {
  // Kept separate so the dialog still has its task while it animates closed
  const [editing, setEditing] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (milestones.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  const ordered = [...milestones].sort(byDueDate);

  return (
    <>
      <ol className="flex flex-col">
        {ordered.map((milestone, index) => {
          const completed = milestone.status === "Completed";
          const inProgress = milestone.status === "In progress";
          const overdue = !completed && isOverdue(milestone.due_date);
          const last = index === ordered.length - 1;

          return (
            <li key={milestone.id} className="flex gap-3">
              {/* Marker and connecting line */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    completed && "border-primary bg-primary text-primary-foreground",
                    inProgress && "border-primary bg-accent",
                    !completed && !inProgress && "border-border bg-card"
                  )}
                >
                  {completed && <Check className="size-3" strokeWidth={3} />}
                </span>
                {!last && <span className="w-0.5 flex-1 bg-border" />}
              </div>

              <div className={cn("min-w-0 flex-1", !last && "pb-5")}>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(milestone);
                    setDialogOpen(true);
                  }}
                  className={cn(
                    "text-left text-sm font-medium hover:underline",
                    completed && "text-muted-foreground"
                  )}
                >
                  {milestone.title}
                </button>
                <p className="text-xs text-muted-foreground">
                  <span className={cn(overdue && "font-medium text-destructive")}>
                    {overdue ? "Overdue, " : ""}
                    {formatDueDate(milestone.due_date)}
                  </span>
                  {" · "}
                  {milestone.status}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {editing && (
        <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} />
      )}
    </>
  );
}
