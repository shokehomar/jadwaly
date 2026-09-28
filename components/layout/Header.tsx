"use client";

// Top bar: '<username>'s workspace' label, Add task button, Clerk <UserButton />.
// <UserButton /> comes later with Clerk.
// Imports: @/components/tasks/TaskDialog, @clerk/nextjs

import { useState } from "react";
import { Plus } from "lucide-react";
import { useData } from "@/components/providers/DataProvider";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Button } from "@/components/ui/button";

export function Header() {
  const { profile } = useData();
  const [adding, setAdding] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
      <p className="truncate text-sm font-medium">{profile.name}&apos;s workspace</p>
      <Button onClick={() => setAdding(true)}>
        <Plus data-icon="inline-start" />
        Add task
      </Button>
      <TaskDialog open={adding} onOpenChange={setAdding} />
    </header>
  );
}
