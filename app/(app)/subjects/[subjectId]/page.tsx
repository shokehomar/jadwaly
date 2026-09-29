"use client";

// One subject: predicted grade, study plan, assessments, IA milestones, subject tasks.
// IA milestones are this subject's IA tasks; "Other tasks" is everything else for the subject.
// Imports: @/components/subjects/*, @/components/tasks/TaskCard, @/components/providers/DataProvider

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useData } from "@/components/providers/DataProvider";
import { AssessmentList } from "@/components/subjects/AssessmentList";
import { MilestoneTimeline } from "@/components/subjects/MilestoneTimeline";
import { AddTaskButton } from "@/components/tasks/AddTaskButton";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WEEK_ORDER, WEEKDAYS } from "@/constants";
import { byDueDate, cn, describeStudyDays, formatMinutes } from "@/lib/utils";

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { profile, subjects, tasks, assessments } = useData();

  const subject = subjects.find((s) => s.id === subjectId);

  if (!subject) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-semibold">Subject not found</h1>
        <Link href="/subjects" className="text-sm text-primary hover:underline">
          Back to subjects
        </Link>
      </div>
    );
  }

  const subjectTasks = tasks.filter((t) => t.subject_id === subject.id);
  const iaMilestones = subjectTasks.filter((t) => t.type === "IA");
  const otherTasks = subjectTasks.filter((t) => t.type !== "IA").sort(byDueDate);
  const subjectAssessments = assessments.filter((a) => a.subject_id === subject.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/subjects"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Subjects
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden
            className="size-3.5 shrink-0 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <h1 className="text-2xl font-semibold">{subject.name}</h1>
          <Badge variant="outline">{subject.level}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Predicted grade</p>
            <p className="text-3xl font-semibold tracking-tight">
              {subject.predicted_grade ?? "–"}
              <span className="text-base font-normal text-muted-foreground"> / 7</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Study plan</p>
                <p className="text-lg font-semibold">
                  {subject.session_minutes} min ·{" "}
                  {describeStudyDays(subject.study_days, profile.weekend_days)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatMinutes(subject.session_minutes * subject.study_days.length)} a week
                </p>
              </div>
              <Badge variant="secondary">{subject.priority} priority</Badge>
            </div>
            <ul className="flex flex-wrap gap-1.5" aria-label="Study days">
              {WEEK_ORDER.map((day) => {
                const active = subject.study_days.includes(day);
                return (
                  <li
                    key={day}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium",
                      active ? "text-white" : "bg-surface text-muted-foreground"
                    )}
                    style={active ? { backgroundColor: subject.color } : undefined}
                  >
                    <span aria-hidden>{WEEKDAYS[day].short}</span>
                    <span className="sr-only">
                      {WEEKDAYS[day].long}: {active ? "study day" : "no study"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>IA milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {iaMilestones.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center">
                <div>
                  <p className="text-sm font-medium">No IA tasks yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your IA steps, like the research question, first draft, and final
                    submission, to see them here in order.
                  </p>
                </div>
                <AddTaskButton
                  variant="outline"
                  label="Add IA task"
                  defaults={{ type: "IA", subject_id: subject.id }}
                />
              </div>
            ) : (
              <MilestoneTimeline milestones={iaMilestones} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentList assessments={subjectAssessments} color={subject.color} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Other tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {otherTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other tasks for this subject.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {otherTasks.map((task) => (
                <li key={task.id}>
                  <TaskCard task={task} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
