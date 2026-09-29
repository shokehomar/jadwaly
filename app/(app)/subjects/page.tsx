"use client";

// Grid of the student's subjects (any number, not always 6) with HL/SL, predicted grade, study plan.
// Imports: @/components/subjects/SubjectCard, @/components/providers/DataProvider

import { useData } from "@/components/providers/DataProvider";
import { SubjectCard } from "@/components/subjects/SubjectCard";

export default function SubjectsPage() {
  const { profile, subjects } = useData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Subjects</h1>
        <p className="text-sm text-muted-foreground">
          {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
        </p>
      </div>

      {subjects.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No subjects yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} weekendDays={profile.weekend_days} />
          ))}
        </div>
      )}
    </div>
  );
}
