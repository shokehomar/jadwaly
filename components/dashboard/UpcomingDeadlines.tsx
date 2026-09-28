"use client";

// Next 7 days of tasks (today included), overdue pinned on top. Completed tasks are left out.
// Exams are left out too; they have their own section (UpcomingExams).
// Imports: @/components/tasks/TaskCard. Used by: dashboard

import { useData } from "@/components/providers/DataProvider";
import { TaskCard } from "@/components/tasks/TaskCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addDays, byDueDate, todayString } from "@/lib/utils";

export function UpcomingDeadlines() {
  const { tasks } = useData();

  const today = todayString();
  const lastDay = addDays(today, 6);
  const open = tasks.filter((t) => t.status !== "Completed" && t.type !== "Exam");
  const overdue = open.filter((t) => t.due_date < today).sort(byDueDate);
  const upcoming = open
    .filter((t) => t.due_date >= today && t.due_date <= lastDay)
    .sort(byDueDate);
  const items = [...overdue, ...upcoming];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming deadlines</CardTitle>
        <CardDescription>
          Next 7 days{overdue.length > 0 && `, plus ${overdue.length} overdue`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nothing due in the next 7 days.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
