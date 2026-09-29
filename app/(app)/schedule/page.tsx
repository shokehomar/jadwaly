"use client";

// This week's study schedule, Monday to Sunday, from the scheduler (lib/study-plan.ts):
// "couldn't fit" list at the top, then each day's sessions (done/missed on past days),
// exams, and extracurriculars.
// Imports: @/components/schedule/*, @/hooks/use-week-plan, @/components/providers/DataProvider

import { useData } from "@/components/providers/DataProvider";
import { CouldNotFitList } from "@/components/schedule/CouldNotFitList";
import { ScheduleDay } from "@/components/schedule/ScheduleDay";
import { useWeekPlan } from "@/hooks/use-week-plan";
import { extracurricularsForDay } from "@/lib/study-plan";
import { formatDueDate } from "@/lib/utils";

export default function SchedulePage() {
  const week = useWeekPlan();
  const { subjects, tasks, extracurriculars } = useData();

  if (!week) {
    return <h1 className="text-2xl font-semibold">Schedule</h1>;
  }

  const { today, plan, statuses } = week;
  const firstDay = plan.days[0].date;
  const lastDay = plan.days[plan.days.length - 1].date;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Schedule</h1>
        <p className="text-sm text-muted-foreground">
          {formatDueDate(firstDay)} to {formatDueDate(lastDay)}
        </p>
      </div>

      <CouldNotFitList items={plan.couldNotFit} subjects={subjects} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {plan.days.map((day, i) => (
          <ScheduleDay
            key={day.date}
            day={day}
            statuses={statuses[i]}
            isToday={day.date === today}
            subjects={subjects}
            exams={tasks.filter((t) => t.type === "Exam" && t.due_date === day.date)}
            extracurriculars={extracurricularsForDay(day.date, extracurriculars, tasks)}
          />
        ))}
      </div>
    </div>
  );
}
