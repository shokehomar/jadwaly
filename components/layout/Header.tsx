"use client";

// Top bar: '<username>'s workspace' label, Add task button, Clerk <UserButton />.
// On phones the Add task button is hidden here; the floating button replaces it.
// <UserButton /> comes later with Clerk.
// Imports: @/components/tasks/AddTaskButton, @clerk/nextjs

import { useData } from "@/components/providers/DataProvider";
import { AddTaskButton } from "@/components/tasks/AddTaskButton";

export function Header() {
  const { profile } = useData();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
      <p className="truncate text-sm font-medium">{profile.name}&apos;s workspace</p>
      <AddTaskButton className="hidden md:inline-flex" />
    </header>
  );
}
