"use client";

// Today's study sessions from the scheduler (lib/study-plan.ts): subject, minutes, reason,
// with Done / Undo buttons that add or remove a study log. Also today's extracurriculars.
// Imports: @/hooks/use-week-plan, @/lib/study-plan (extracurricularsForDay). Used by: dashboard

import Link from "next/link";
import { Check } from "lucide-react";
import { useData } from "@/components/providers/DataProvider";
import { ExtracurricularList } from "@/components/schedule/ExtracurricularList";
import { SessionRow } from "@/components/schedule/SessionRow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWeekPlan } from "@/hooks/use-week-plan";
import { extracurricularsForDay } from "@/lib/study-plan";
import { formatMinutes } from "@/lib/utils";
import type { StudySession } from "@/types";

export function TodayPlan() {
  const week = useWeekPlan();
  const { subjects, tasks, extracurriculars, studyLogs, addStudyLog, deleteStudyLog } = useData();

  if (!week) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  const { today, plan, statuses } = week;
  const dayIndex = plan.days.findIndex((d) => d.date === today);
  const sessions = plan.days[dayIndex].sessions;
  const dayStatuses = statuses[dayIndex];
  const activities = extracurricularsForDay(today, extracurriculars, tasks);

  const planned = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const done = sessions.reduce((sum, s, i) => sum + (dayStatuses[i] === "done" ? s.minutes : 0), 0);

  function markDone(session: StudySession) {
    addStudyLog({ subject_id: session.subjectId, date: today, minutes: session.minutes });
  }

  // Remove one of today's logs for the subject: the latest with the same
  // minutes (what Done added), otherwise the latest.
  function undo(session: StudySession) {
    const todaysLogs = studyLogs.filter(
      (l) => l.subject_id === session.subjectId && l.date === today
    );
    const log =
      todaysLogs.findLast((l) => l.minutes === session.minutes) ?? todaysLogs.at(-1);
    if (log) deleteStudyLog(log.id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s plan</CardTitle>
        <CardDescription>
          {sessions.length === 0
            ? "No study planned today"
            : `${formatMinutes(done)} of ${formatMinutes(planned)} done`}
        </CardDescription>
        <CardAction>
          <Link href="/schedule" className="text-sm text-primary hover:underline">
            Week
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sessions.length > 0 && (
          <ul className="flex flex-col gap-2">
            {sessions.map((session, i) => (
              <li key={i}>
                <SessionRow
                  session={session}
                  subject={subjects.find((s) => s.id === session.subjectId)}
                  status={dayStatuses[i]}
                  action={
                    dayStatuses[i] === "done" ? (
                      <Button variant="ghost" size="sm" onClick={() => undo(session)}>
                        Undo
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => markDone(session)}>
                        <Check data-icon="inline-start" />
                        Done
                      </Button>
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
        <ExtracurricularList items={activities} />
      </CardContent>
    </Card>
  );
}
