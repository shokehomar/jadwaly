"use client";

// Client-side data store for the whole app. Pages and components read and write
// data only through useData(), never from constants/mock-data directly.
// Phase 1: state starts from mock data and lives in memory (resets on reload).
// Later: swap the initial load and update functions for Supabase calls; the
// useData() shape stays the same so the UI does not change.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Profile, Subject, Task } from "@/types";
import { mockProfile, mockSubjects, mockTasks } from "@/constants/mock-data";

export type NewSubject = Omit<Subject, "id" | "user_id">;
export type NewTask = Omit<Task, "id" | "user_id">;

interface DataContextValue {
  profile: Profile;
  subjects: Subject[];
  tasks: Task[];

  updateProfile: (changes: Partial<Omit<Profile, "id">>) => void;

  addSubject: (subject: NewSubject) => Subject;
  updateSubject: (id: string, changes: Partial<NewSubject>) => void;
  deleteSubject: (id: string) => void;

  addTask: (task: NewTask) => Task;
  updateTask: (id: string, changes: Partial<NewTask>) => void;
  deleteTask: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(mockProfile);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const updateProfile = useCallback(
    (changes: Partial<Omit<Profile, "id">>) =>
      setProfile((prev) => ({ ...prev, ...changes })),
    []
  );

  const addSubject = useCallback(
    (subject: NewSubject) => {
      const created: Subject = { ...subject, id: crypto.randomUUID(), user_id: profile.id };
      setSubjects((prev) => [...prev, created]);
      return created;
    },
    [profile.id]
  );

  const updateSubject = useCallback(
    (id: string, changes: Partial<NewSubject>) =>
      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s))),
    []
  );

  // Tasks linked to a deleted subject are kept, with the link cleared
  // (matches an ON DELETE SET NULL foreign key).
  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) =>
      prev.map((t) => (t.subject_id === id ? { ...t, subject_id: null } : t))
    );
  }, []);

  const addTask = useCallback(
    (task: NewTask) => {
      const created: Task = { ...task, id: crypto.randomUUID(), user_id: profile.id };
      setTasks((prev) => [...prev, created]);
      return created;
    },
    [profile.id]
  );

  const updateTask = useCallback(
    (id: string, changes: Partial<NewTask>) =>
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t))),
    []
  );

  const deleteTask = useCallback(
    (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const value = useMemo<DataContextValue>(
    () => ({
      profile,
      subjects,
      tasks,
      updateProfile,
      addSubject,
      updateSubject,
      deleteSubject,
      addTask,
      updateTask,
      deleteTask,
    }),
    [
      profile,
      subjects,
      tasks,
      updateProfile,
      addSubject,
      updateSubject,
      deleteSubject,
      addTask,
      updateTask,
      deleteTask,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used inside <DataProvider>");
  }
  return context;
}
