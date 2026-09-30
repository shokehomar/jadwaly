"use client";

// Task fields (react-hook-form + zod): title, type, subject, due date, status, priority, notes.
// Creates a new task, or edits `task` when given. Saves through the data provider.
// Delete (existing tasks) asks for confirmation first.
// Imports: @/components/providers/DataProvider (addTask, updateTask, deleteTask), @/constants (TASK_TYPES)

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useData, type NewTask } from "@/components/providers/DataProvider";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DIPLOMA_ONLY_TASK_TYPES,
  PRIORITIES,
  STATUSES,
  TASK_TYPES,
  TASK_TYPES_NEEDING_SUBJECT,
} from "@/constants";
import { todayString } from "@/lib/utils";
import type { Task } from "@/types";

// The subject select needs a string value, so "no subject" is stored as this
// and turned into null on save.
const NO_SUBJECT = "none";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Give the task a title").max(120, "Keep the title under 120 characters"),
  type: z.enum(TASK_TYPES),
  subject_id: z.string(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a due date"),
  status: z.enum(STATUSES),
  priority: z.enum(PRIORITIES),
  notes: z.string().trim().max(1000, "Keep notes under 1,000 characters"),
}).superRefine((values, ctx) => {
  // Exams and IAs must belong to a subject
  if (TASK_TYPES_NEEDING_SUBJECT.includes(values.type) && values.subject_id === NO_SUBJECT) {
    ctx.addIssue({
      code: "custom",
      path: ["subject_id"],
      message: `Pick the subject this ${values.type === "IA" ? "IA" : "exam"} is for`,
    });
  }
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  /** Starting values for a new task, e.g. type and subject */
  defaults?: Partial<NewTask>;
  onDone: () => void;
}

export function TaskForm({ task, defaults, onDone }: TaskFormProps) {
  const { profile, subjects, addTask, updateTask, deleteTask } = useData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? defaults?.title ?? "",
      type: task?.type ?? defaults?.type ?? "Study",
      subject_id: task?.subject_id ?? defaults?.subject_id ?? NO_SUBJECT,
      due_date: task?.due_date ?? defaults?.due_date ?? todayString(),
      status: task?.status ?? defaults?.status ?? "Not started",
      priority: task?.priority ?? defaults?.priority ?? "Medium",
      notes: task?.notes ?? defaults?.notes ?? "",
    },
  });

  // Non-diploma students have no EE, TOK, or CAS. Keep the task's current
  // type in the list when editing so it still displays.
  const typeOptions = TASK_TYPES.filter(
    (type) =>
      profile.diploma || !DIPLOMA_ONLY_TASK_TYPES.includes(type) || type === task?.type
  );

  const subjectItems: Record<string, string> = {
    [NO_SUBJECT]: "No subject",
    ...Object.fromEntries(subjects.map((s) => [s.id, s.name])),
  };

  function onSubmit(values: TaskFormValues) {
    const data = {
      ...values,
      subject_id: values.subject_id === NO_SUBJECT ? null : values.subject_id,
      notes: values.notes === "" ? null : values.notes,
    };
    if (task) {
      updateTask(task.id, data);
    } else {
      addTask(data);
    }
    onDone();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <Input
                {...field}
                id="task-title"
                placeholder="e.g. Biology IA first draft"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="task-type">Type</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                >
                  <SelectTrigger id="task-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="subject_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="task-subject">Subject</FieldLabel>
                <Select
                  items={subjectItems}
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                >
                  <SelectTrigger
                    id="task-subject"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SUBJECT}>No subject</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="due_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="task-due-date">Due date</FieldLabel>
                <Input
                  {...field}
                  id="task-due-date"
                  type="date"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                >
                  <SelectTrigger id="task-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="task-status">Status</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                >
                  <SelectTrigger id="task-status" className="w-full">
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
              </Field>
            )}
          />
        </div>

        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="task-notes">Notes</FieldLabel>
              <Textarea
                {...field}
                id="task-notes"
                rows={3}
                placeholder="Optional"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {task && (
            <Button
              type="button"
              variant="destructive"
              className="sm:mr-auto"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </Button>
          )}
          <Button type="button" variant="outline" className="sm:ml-auto" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit">{task ? "Save changes" : "Add task"}</Button>
        </div>
      </FieldGroup>

      {task && (
        <ConfirmDialog
          open={confirmingDelete}
          onOpenChange={setConfirmingDelete}
          title="Delete this task?"
          description={`"${task.title}" will be deleted. This can't be undone.`}
          confirmLabel="Delete task"
          onConfirm={() => {
            onDone();
            deleteTask(task.id);
          }}
        />
      )}
    </form>
  );
}
