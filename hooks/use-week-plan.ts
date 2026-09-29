"use client";

// The current week's study plan (Monday to Sunday, browser's local date) with
// done/missed status for each session. Null until the browser's date is known.
// Used by: components/dashboard/TodayPlan, app/(app)/schedule

import { useMemo } from "react";
import { useData } from "@/components/providers/DataProvider";
import { useToday } from "@/hooks/use-today";
import { generateWeek, sessionStatuses, weekStartOf } from "@/lib/study-plan";
import type { SessionStatus, WeekPlan } from "@/types";

export interface CurrentWeek {
  today: string;
  weekStart: string;
  plan: WeekPlan;
  /** Same shape as plan.days[i].sessions */
  statuses: SessionStatus[][];
}

export function useWeekPlan(): CurrentWeek | null {
  const today = useToday();
  const { profile, subjects, tasks, studyLogs } = useData();

  return useMemo(() => {
    if (!today) return null;
    const weekStart = weekStartOf(today);
    const plan = generateWeek(weekStart, today, profile, subjects, tasks, studyLogs);
    return { today, weekStart, plan, statuses: sessionStatuses(plan, today, studyLogs) };
  }, [today, profile, subjects, tasks, studyLogs]);
}
