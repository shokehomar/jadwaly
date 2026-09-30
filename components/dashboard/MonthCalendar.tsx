"use client";

// Month grid; dots colored by subject; click a day to list its tasks below the grid.
// Weeks start on Monday. Tasks with no subject get a grey dot.
// Imports: date-fns, @/components/tasks/TaskCard. Used by: dashboard

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useData } from "@/components/providers/DataProvider";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToday } from "@/hooks/use-today";
import { cn, formatDueDate } from "@/lib/utils";
import type { Task } from "@/types";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_DOTS = 3;

export function MonthCalendar() {
  const { tasks, subjects } = useData();
  const today = useToday();
  // null means "the current month" / "today", both from the browser's date
  const [monthChoice, setMonthChoice] = useState<Date | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  if (!today) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  const month = monthChoice ?? startOfMonth(parseISO(today));
  const selected = selectedChoice ?? today;

  const days = eachDayOfInterval({
    start: startOfWeek(month, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  const tasksByDate = new Map<string, Task[]>();
  for (const task of tasks) {
    tasksByDate.set(task.due_date, [...(tasksByDate.get(task.due_date) ?? []), task]);
  }
  const colorOf = (task: Task) =>
    subjects.find((s) => s.id === task.subject_id)?.color ?? "var(--muted-foreground)";

  const selectedTasks = tasksByDate.get(selected) ?? [];

  function goToToday() {
    setMonthChoice(null);
    setSelectedChoice(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{format(month, "MMMM yyyy")}</CardTitle>
        <CardAction className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => setMonthChoice(addMonths(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => setMonthChoice(addMonths(month, 1))}
          >
            <ChevronRight />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="pb-1 text-xs text-muted-foreground">
              {label}
            </div>
          ))}

          {days.map((day) => {
            const date = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(date) ?? [];
            const isSelected = date === selected;
            const isToday = date === today;

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedChoice(date)}
                aria-pressed={isSelected}
                aria-label={`${format(day, "EEEE d MMMM")}, ${dayTasks.length} ${
                  dayTasks.length === 1 ? "task" : "tasks"
                }`}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors hover:bg-surface sm:aspect-auto sm:h-14",
                  !isSameMonth(day, month) && "text-muted-foreground/50",
                  isToday && "font-semibold text-primary",
                  isSelected && "bg-accent hover:bg-accent"
                )}
              >
                {format(day, "d")}
                <span className="flex h-1.5 items-center gap-0.5">
                  {dayTasks.slice(0, MAX_DOTS).map((task) => (
                    <span
                      key={task.id}
                      className={cn(
                        "size-1.5 rounded-full",
                        task.status === "Completed" && "opacity-35"
                      )}
                      style={{ backgroundColor: colorOf(task) }}
                    />
                  ))}
                  {dayTasks.length > MAX_DOTS && (
                    <span className="text-[9px] leading-none text-muted-foreground">+</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 border-t pt-4">
          <h3 className="text-sm font-medium">
            {selected === today ? "Today" : formatDueDate(selected)}
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing due on this day.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedTasks.map((task) => (
                <li key={task.id}>
                  <TaskCard task={task} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
