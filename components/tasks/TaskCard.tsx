"use client";

// One task row: title, subject color, type, due date, priority, status select.
// Clicking the title opens TaskDialog to edit the task.
// Imports: ./StatusSelect, ./TaskDialog

import { useState } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Badge } from "@/components/ui/badge";
import { useToday } from "@/hooks/use-today";
import { cn, formatDueDate, isOverdue } from "@/lib/utils";
import type { Priority, Task } from "@/types";
import { StatusSelect } from "./StatusSelect";
import { TaskDialog } from "./TaskDialog";

const PRIORITY_VARIANT: Record<Priority, "destructive" | "secondary" | "outline"> = {
  High: "destructive",
  Medium: "secondary",
  Low: "outline",
};

export function TaskCard({ task }: { task: Task }) {
  const { subjects } = useData();
  const [editing, setEditing] = useState(false);

  const subject = subjects.find((s) => s.id === task.subject_id);
  const completed = task.status === "Completed";
  const today = useToday();
  // Not flagged until the browser's date is known
  const overdue = !completed && today !== null && isOverdue(task.due_date, today);

  return (
    <div className="@container flex items-stretch gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/5">
      <span
        aria-hidden
        className="w-1 shrink-0 rounded-full bg-border"
        style={subject ? { backgroundColor: subject.color } : undefined}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3 @md:flex-row @md:items-center">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "block max-w-full truncate text-left font-medium hover:underline",
              completed && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </button>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {[subject?.name, task.type].filter(Boolean).join(" · ")}
            {" · "}
            <span className={cn(overdue && "font-medium text-destructive")}>
              {overdue ? "Overdue, " : "Due "}
              {formatDueDate(task.due_date)}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
          <StatusSelect task={task} />
        </div>
      </div>

      <TaskDialog open={editing} onOpenChange={setEditing} task={task} />
    </div>
  );
}
