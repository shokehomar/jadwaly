// One day of the week: date, total minutes, exams that day, sessions with
// done/missed status, and extracurriculars.
// Used by: app/(app)/schedule

import { ExtracurricularList } from "@/components/schedule/ExtracurricularList";
import { SessionRow } from "@/components/schedule/SessionRow";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDueDate, formatMinutes } from "@/lib/utils";
import type { DayPlan, Extracurricular, SessionStatus, Subject, Task } from "@/types";

interface ScheduleDayProps {
  day: DayPlan;
  statuses: SessionStatus[];
  isToday: boolean;
  subjects: Subject[];
  exams: Task[];
  extracurriculars: Extracurricular[];
}

export function ScheduleDay({
  day,
  statuses,
  isToday,
  subjects,
  exams,
  extracurriculars,
}: ScheduleDayProps) {
  const total = day.sessions.reduce((sum, s) => sum + s.minutes, 0);
  const subjectName = (id: string | null) => subjects.find((s) => s.id === id)?.name;

  return (
    <Card className={cn(isToday && "ring-2 ring-primary")}>
      <CardHeader>
        <CardTitle>{formatDueDate(day.date)}</CardTitle>
        <CardDescription>
          {total === 0 ? "No study" : `${formatMinutes(total)} of study`}
        </CardDescription>
        {isToday && (
          <CardAction>
            <Badge>Today</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {exams.map((exam) => (
          <p key={exam.id} className="text-sm font-medium text-destructive">
            Exam: {subjectName(exam.subject_id) ?? exam.title}
          </p>
        ))}
        {day.sessions.length > 0 && (
          <ul className="flex flex-col gap-2">
            {day.sessions.map((session, i) => (
              <li key={i}>
                <SessionRow
                  session={session}
                  subject={subjects.find((s) => s.id === session.subjectId)}
                  status={statuses[i]}
                />
              </li>
            ))}
          </ul>
        )}
        <ExtracurricularList items={extracurriculars} />
      </CardContent>
    </Card>
  );
}
