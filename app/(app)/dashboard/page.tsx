"use client";

// Home: greeting, stat cards, today's study plan, upcoming exams, upcoming deadlines, task board, month calendar.
// Imports: @/components/dashboard/*, @/components/providers/DataProvider

import { MonthCalendar } from "@/components/dashboard/MonthCalendar";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskBoard } from "@/components/dashboard/TaskBoard";
import { TodayPlan } from "@/components/dashboard/TodayPlan";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { UpcomingExams } from "@/components/dashboard/UpcomingExams";
import { useData } from "@/components/providers/DataProvider";
import { AddTaskButton } from "@/components/tasks/AddTaskButton";
import { useToday } from "@/hooks/use-today";
import { addDays, formatDueDate } from "@/lib/utils";

export default function DashboardPage() {
  const { profile, subjects, tasks } = useData();

  const today = useToday();

  // Predicted total: sum of subject grades (7 each). EE and TOK bonus points
  // are not tracked yet, so they are not counted.
  const graded = subjects.filter((s) => s.predicted_grade !== null);
  const predictedTotal = graded.reduce((sum, s) => sum + (s.predicted_grade ?? 0), 0);
  const predictedDetail =
    graded.length < subjects.length
      ? `Out of ${subjects.length * 7}. ${graded.length} of ${subjects.length} subjects have a grade`
      : `Out of ${subjects.length * 7}, from subject grades`;

  // Needs the browser's date; null until it's known
  const dueThisWeek = today
    ? tasks.filter(
        (t) => t.status !== "Completed" && t.due_date >= today && t.due_date <= addDays(today, 6)
      ).length
    : null;

  const completed = tasks.filter((t) => t.status === "Completed").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Hi, {profile.name}</h1>
          <p className="h-5 text-sm text-muted-foreground">{today && formatDueDate(today)}</p>
        </div>
        <AddTaskButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Predicted total"
          value={graded.length > 0 ? String(predictedTotal) : "–"}
          detail={predictedDetail}
        />
        <StatCard
          label="Due this week"
          value={dueThisWeek === null ? "–" : String(dueThisWeek)}
          detail={dueThisWeek === 1 ? "Task in the next 7 days" : "Tasks in the next 7 days"}
        />
        <StatCard
          label="Completed"
          value={String(completed)}
          detail={`Of ${tasks.length} tasks`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <TodayPlan />
          <UpcomingExams />
          <UpcomingDeadlines />
        </div>
        <div className="min-w-0">
          <MonthCalendar />
        </div>
      </div>

      <TaskBoard />
    </div>
  );
}
