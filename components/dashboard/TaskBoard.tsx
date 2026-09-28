"use client";

// Three columns: Not started / In progress / Completed with counts.
// Tasks move between columns when their status changes.
// Imports: @/components/tasks/TaskCard, @/constants (STATUSES). Used by: dashboard

import { useData } from "@/components/providers/DataProvider";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUSES } from "@/constants";
import { byDueDate } from "@/lib/utils";

export function TaskBoard() {
  const { tasks } = useData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>All tasks</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-4">
        {STATUSES.map((status) => {
          const column = tasks.filter((t) => t.status === status).sort(byDueDate);
          return (
            <section key={status} className="flex min-w-0 flex-col gap-3 rounded-xl bg-surface p-3">
              <h3 className="flex items-center justify-between px-1 text-sm font-medium">
                {status}
                <span className="text-muted-foreground">{column.length}</span>
              </h3>
              {column.length === 0 ? (
                <p className="px-1 py-4 text-center text-sm text-muted-foreground">No tasks</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {column.map((task) => (
                    <li key={task.id}>
                      <TaskCard task={task} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
