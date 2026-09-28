"use client";

// Modal wrapping TaskForm; opened by the Add task button (new task) or a TaskCard (edit).
// The parent controls `open`, so any button can open it.
// Imports: ./TaskForm, @/components/ui/dialog

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/types";
import { TaskForm } from "./TaskForm";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this task; leave out to add a new one */
  task?: Task;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Add task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details of this task." : "Add a deadline or piece of work to track."}
          </DialogDescription>
        </DialogHeader>
        {/* Content unmounts when closed, so the form resets each time it opens */}
        <TaskForm task={task} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
