"use client";

// Add task button that opens TaskDialog. "floating" is the round button shown
// on phone widths only, above the bottom tab bar.
// Used by: components/layout/Header, app/(app)/layout, dashboard, subjects/[subjectId]

import { useState } from "react";
import { Plus } from "lucide-react";
import type { NewTask } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TaskDialog } from "./TaskDialog";

interface AddTaskButtonProps {
  label?: string;
  variant?: "default" | "outline" | "floating";
  /** Starting values for the new task, e.g. type and subject */
  defaults?: Partial<NewTask>;
  className?: string;
}

export function AddTaskButton({
  label = "Add task",
  variant = "default",
  defaults,
  className,
}: AddTaskButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "floating" ? (
        <Button
          onClick={() => setOpen(true)}
          aria-label={label}
          className={cn(
            "fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 size-14 rounded-full shadow-lg md:hidden [&_svg:not([class*='size-'])]:size-6",
            className
          )}
        >
          <Plus />
        </Button>
      ) : (
        <Button variant={variant} onClick={() => setOpen(true)} className={className}>
          <Plus data-icon="inline-start" />
          {label}
        </Button>
      )}
      <TaskDialog open={open} onOpenChange={setOpen} defaults={defaults} />
    </>
  );
}
