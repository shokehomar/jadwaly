"use client";

// Exam tasks from today onward that aren't completed, soonest first, with days remaining.
// Exams are left out of UpcomingDeadlines so they only show here.
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
import { useToday } from "@/hooks/use-today";
import { byDueDate, cn, daysUntil } from "@/lib/utils";

export function UpcomingExams() {
  const { tasks } = useData();

  const today = useToday();

  if (!today) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming exams</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  const exams = tasks
    .filter((t) => t.type === "Exam" && t.status !== "Completed" && t.due_date >= today)
    .sort(byDueDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming exams</CardTitle>
        <CardDescription>
          {exams.length === 0
            ? "No exams coming up"
            : `${exams.length} ${exams.length === 1 ? "exam" : "exams"} coming up`}
        </CardDescription>
      </CardHeader>
      {exams.length > 0 && (
        <CardContent>
          <ul className="flex flex-col gap-2">
            {exams.map((exam) => {
              const days = daysUntil(exam.due_date, today);
              return (
                <li key={exam.id} className="flex items-stretch gap-2">
                  <div
                    className={cn(
                      "flex w-16 shrink-0 flex-col items-center justify-center rounded-xl text-center",
                      days <= 3 ? "bg-primary text-primary-foreground" : "bg-surface"
                    )}
                  >
                    {days === 0 ? (
                      <span className="text-sm font-semibold">Today</span>
                    ) : (
                      <>
                        <span className="text-xl leading-none font-semibold">{days}</span>
                        <span className="text-[11px]">{days === 1 ? "day" : "days"}</span>
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <TaskCard task={exam} />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
