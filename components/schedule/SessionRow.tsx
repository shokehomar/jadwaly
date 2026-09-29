// One study session: subject color, name, minutes, reason, and done/missed status.
// `action` is an optional button on the right (Done / Undo on today's plan).
// Used by: components/dashboard/TodayPlan, components/schedule/ScheduleDay

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionReason, SessionStatus, StudySession, Subject } from "@/types";

const REASON_LABEL: Record<SessionReason, string> = {
  regular: "Regular",
  "exam prep": "Exam prep",
  "carried over": "Carried over",
};

interface SessionRowProps {
  session: StudySession;
  subject: Subject | undefined;
  status: SessionStatus;
  action?: React.ReactNode;
}

export function SessionRow({ session, subject, status, action }: SessionRowProps) {
  const done = status === "done";

  return (
    <div className="flex items-center gap-3 rounded-lg bg-card py-2 pr-2 pl-3 ring-1 ring-foreground/5">
      <span
        aria-hidden
        className="h-8 w-1 shrink-0 rounded-full bg-border"
        style={subject ? { backgroundColor: subject.color } : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", done && "text-muted-foreground line-through")}>
          {subject?.name ?? "Unknown subject"}
        </p>
        <p className="text-xs text-muted-foreground">
          {session.minutes} min ·{" "}
          <span className={cn(session.reason === "exam prep" && "font-medium text-primary")}>
            {REASON_LABEL[session.reason]}
          </span>
        </p>
      </div>
      {status === "done" && (
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
          <Check className="size-3.5" />
          Done
        </span>
      )}
      {status === "missed" && (
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-destructive">
          <X className="size-3.5" />
          Missed
        </span>
      )}
      {action}
    </div>
  );
}
