"use client";

// Client-side data store for the signed-in pages. Pages and components read and write
// data only through useData().
// State starts from the user's Supabase data, loaded on the server by app/(app)/layout
// (lib/user-data.ts) and passed in as initialData.
// Writes update the screen immediately, then save through a server action (lib/actions).
// If the action fails, only what that change touched is put back (./optimistic) and a
// toast says so. New rows get their UUID here, so the screen already matches the
// database and nothing needs reloading after a save.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import * as extracurricularActions from "@/lib/actions/extracurricular.actions";
import * as profileActions from "@/lib/actions/profile.actions";
import type { ActionResult } from "@/lib/actions/result";
import * as studyLogActions from "@/lib/actions/study-log.actions";
import * as subjectActions from "@/lib/actions/subject.actions";
import * as taskActions from "@/lib/actions/task.actions";
import type { UserData } from "@/lib/user-data";
import type {
  Assessment,
  Extracurricular,
  Profile,
  StudyLog,
  Subject,
  Task,
} from "@/types";
import {
  relinkTasks,
  removeById,
  restoreAt,
  restoreRows,
  revertFields,
  revertRow,
} from "./optimistic";

export type NewSubject = Omit<Subject, "id" | "user_id">;
export type NewTask = Omit<Task, "id" | "user_id">;
export type NewExtracurricular = Omit<Extracurricular, "id" | "user_id">;
export type NewStudyLog = Omit<StudyLog, "id" | "user_id">;
export type ProfileChanges = Partial<Omit<Profile, "id" | "onboarding_complete">>;

interface DataContextValue {
  profile: Profile;
  subjects: Subject[];
  tasks: Task[];
  /** Read-only for now; nothing adds or edits assessments yet */
  assessments: Assessment[];
  extracurriculars: Extracurricular[];
  studyLogs: StudyLog[];

  updateProfile: (changes: ProfileChanges) => void;

  addSubject: (subject: NewSubject) => Subject;
  updateSubject: (id: string, changes: Partial<NewSubject>) => void;
  deleteSubject: (id: string) => void;

  addTask: (task: NewTask) => Task;
  updateTask: (id: string, changes: Partial<NewTask>) => void;
  deleteTask: (id: string) => void;

  addExtracurricular: (extracurricular: NewExtracurricular) => Extracurricular;
  updateExtracurricular: (id: string, changes: Partial<NewExtracurricular>) => void;
  deleteExtracurricular: (id: string) => void;

  /** Mark a study session done */
  addStudyLog: (log: NewStudyLog) => StudyLog;
  deleteStudyLog: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

const UNDONE_MESSAGE =
  "Couldn't save that change, so it was undone. Check your connection and try again.";

/** Run a server action; if it fails (or can't be reached), undo and tell the user */
function save(action: Promise<ActionResult>, undo: () => void) {
  const fail = () => {
    undo();
    toast.error(UNDONE_MESSAGE);
  };
  action.then((result) => {
    if (!result.ok) fail();
  }, fail);
}

/** The database fills in user_id from the JWT; actions reject it */
function withoutUserId<T extends { user_id: string }>(row: T): Omit<T, "user_id"> {
  const copy: Partial<T> = { ...row };
  delete copy.user_id;
  return copy as Omit<T, "user_id">;
}

interface DataProviderProps {
  initialData: UserData;
  children: React.ReactNode;
}

export function DataProvider({ initialData, children }: DataProviderProps) {
  const [profile, setProfile] = useState<Profile>(initialData.profile);
  const [subjects, setSubjects] = useState<Subject[]>(initialData.subjects);
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
  const [assessments, setAssessments] = useState<Assessment[]>(initialData.assessments);
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>(
    initialData.extracurriculars
  );
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(initialData.studyLogs);

  // Profile ------------------------------------------------------------------

  const updateProfile = useCallback(
    (changes: ProfileChanges) => {
      const previous = profile;
      setProfile((p) => ({ ...p, ...changes }));
      save(profileActions.updateProfile(changes), () =>
        setProfile((p) => revertFields(p, changes, previous))
      );
    },
    [profile]
  );

  // Subjects -----------------------------------------------------------------

  const addSubject = useCallback(
    (subject: NewSubject) => {
      const created: Subject = { ...subject, id: crypto.randomUUID(), user_id: profile.id };
      setSubjects((list) => [...list, created]);
      save(subjectActions.createSubject(withoutUserId(created)), () =>
        setSubjects((list) => removeById(list, created.id))
      );
      return created;
    },
    [profile.id]
  );

  const updateSubject = useCallback(
    (id: string, changes: Partial<NewSubject>) => {
      const previous = subjects.find((s) => s.id === id);
      if (!previous) return;
      setSubjects((list) => list.map((s) => (s.id === id ? { ...s, ...changes } : s)));
      save(subjectActions.updateSubject(id, changes), () =>
        setSubjects((list) => revertRow(list, id, changes, previous))
      );
    },
    [subjects]
  );

  // Tasks linked to a deleted subject are kept, with the link cleared
  // (ON DELETE SET NULL). Assessments and study logs always belong to a subject,
  // so they are deleted with it (ON DELETE CASCADE).
  const deleteSubject = useCallback(
    (id: string) => {
      const index = subjects.findIndex((s) => s.id === id);
      if (index === -1) return;
      const subject = subjects[index];
      const removedAssessments = assessments.filter((a) => a.subject_id === id);
      const removedLogs = studyLogs.filter((l) => l.subject_id === id);
      const unlinkedTaskIds = new Set(tasks.filter((t) => t.subject_id === id).map((t) => t.id));

      setSubjects((list) => removeById(list, id));
      setAssessments((list) => list.filter((a) => a.subject_id !== id));
      setStudyLogs((list) => list.filter((l) => l.subject_id !== id));
      setTasks((list) => list.map((t) => (t.subject_id === id ? { ...t, subject_id: null } : t)));

      save(subjectActions.deleteSubject(id), () => {
        setSubjects((list) => restoreAt(list, subject, index));
        setAssessments((list) => restoreRows(list, removedAssessments));
        setStudyLogs((list) => restoreRows(list, removedLogs));
        setTasks((list) => relinkTasks(list, unlinkedTaskIds, id));
      });
    },
    [subjects, assessments, studyLogs, tasks]
  );

  // Tasks --------------------------------------------------------------------

  const addTask = useCallback(
    (task: NewTask) => {
      const created: Task = { ...task, id: crypto.randomUUID(), user_id: profile.id };
      setTasks((list) => [...list, created]);
      save(taskActions.createTask(withoutUserId(created)), () =>
        setTasks((list) => removeById(list, created.id))
      );
      return created;
    },
    [profile.id]
  );

  const updateTask = useCallback(
    (id: string, changes: Partial<NewTask>) => {
      const previous = tasks.find((t) => t.id === id);
      if (!previous) return;
      setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...changes } : t)));
      save(taskActions.updateTask(id, changes), () =>
        setTasks((list) => revertRow(list, id, changes, previous))
      );
    },
    [tasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return;
      const task = tasks[index];
      setTasks((list) => removeById(list, id));
      save(taskActions.deleteTask(id), () => setTasks((list) => restoreAt(list, task, index)));
    },
    [tasks]
  );

  // Extracurriculars ---------------------------------------------------------

  const addExtracurricular = useCallback(
    (extracurricular: NewExtracurricular) => {
      const created: Extracurricular = {
        ...extracurricular,
        id: crypto.randomUUID(),
        user_id: profile.id,
      };
      setExtracurriculars((list) => [...list, created]);
      save(extracurricularActions.createExtracurricular(withoutUserId(created)), () =>
        setExtracurriculars((list) => removeById(list, created.id))
      );
      return created;
    },
    [profile.id]
  );

  const updateExtracurricular = useCallback(
    (id: string, changes: Partial<NewExtracurricular>) => {
      const previous = extracurriculars.find((e) => e.id === id);
      if (!previous) return;
      setExtracurriculars((list) => list.map((e) => (e.id === id ? { ...e, ...changes } : e)));
      save(extracurricularActions.updateExtracurricular(id, changes), () =>
        setExtracurriculars((list) => revertRow(list, id, changes, previous))
      );
    },
    [extracurriculars]
  );

  const deleteExtracurricular = useCallback(
    (id: string) => {
      const index = extracurriculars.findIndex((e) => e.id === id);
      if (index === -1) return;
      const extracurricular = extracurriculars[index];
      setExtracurriculars((list) => removeById(list, id));
      save(extracurricularActions.deleteExtracurricular(id), () =>
        setExtracurriculars((list) => restoreAt(list, extracurricular, index))
      );
    },
    [extracurriculars]
  );

  // Study logs ---------------------------------------------------------------

  const addStudyLog = useCallback(
    (log: NewStudyLog) => {
      const created: StudyLog = { ...log, id: crypto.randomUUID(), user_id: profile.id };
      setStudyLogs((list) => [...list, created]);
      save(studyLogActions.createStudyLog(withoutUserId(created)), () =>
        setStudyLogs((list) => removeById(list, created.id))
      );
      return created;
    },
    [profile.id]
  );

  const deleteStudyLog = useCallback(
    (id: string) => {
      const index = studyLogs.findIndex((l) => l.id === id);
      if (index === -1) return;
      const log = studyLogs[index];
      setStudyLogs((list) => removeById(list, id));
      save(studyLogActions.deleteStudyLog(id), () =>
        setStudyLogs((list) => restoreAt(list, log, index))
      );
    },
    [studyLogs]
  );

  const value = useMemo<DataContextValue>(
    () => ({
      profile,
      subjects,
      tasks,
      assessments,
      extracurriculars,
      studyLogs,
      updateProfile,
      addSubject,
      updateSubject,
      deleteSubject,
      addTask,
      updateTask,
      deleteTask,
      addExtracurricular,
      updateExtracurricular,
      deleteExtracurricular,
      addStudyLog,
      deleteStudyLog,
    }),
    [
      profile,
      subjects,
      tasks,
      assessments,
      extracurriculars,
      studyLogs,
      updateProfile,
      addSubject,
      updateSubject,
      deleteSubject,
      addTask,
      updateTask,
      deleteTask,
      addExtracurricular,
      updateExtracurricular,
      deleteExtracurricular,
      addStudyLog,
      deleteStudyLog,
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
