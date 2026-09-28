"use client";

// Status dropdown; updates task status on change.
// Imports: @/components/providers/DataProvider (updateTask), @/constants (STATUSES)

import { useData } from "@/components/providers/DataProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES } from "@/constants";
import type { Task, TaskStatus } from "@/types";

export function StatusSelect({ task }: { task: Task }) {
  const { updateTask } = useData();

  return (
    <Select<TaskStatus>
      value={task.status}
      onValueChange={(status) => {
        if (status) updateTask(task.id, { status });
      }}
    >
      <SelectTrigger size="sm" className="w-32" aria-label="Status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
