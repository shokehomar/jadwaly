"use client";

// Top bar: '<username>'s workspace' label, Add task button, Clerk <UserButton />.
// Add task button and <UserButton /> come later (TaskDialog, Clerk).
// Imports: @/components/tasks/TaskDialog, @clerk/nextjs

import { useData } from "@/components/providers/DataProvider";

export function Header() {
  const { profile } = useData();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
      <p className="text-sm font-medium">{profile.name}&apos;s workspace</p>
    </header>
  );
}
