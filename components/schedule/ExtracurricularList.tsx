// A day's extracurriculars as small muted rows: name, start time, duration.
// Used by: components/dashboard/TodayPlan, components/schedule/ScheduleDay

import { Clock } from "lucide-react";
import { formatMinutes } from "@/lib/utils";
import type { Extracurricular } from "@/types";

export function ExtracurricularList({ items }: { items: Extracurricular[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" />
          <span className="truncate">
            {item.name} · {item.start_time}, {formatMinutes(item.duration_minutes)}
          </span>
        </li>
      ))}
    </ul>
  );
}
