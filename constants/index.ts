// Static data: IB_SUBJECTS (by group), TASK_TYPES (IA, EE, TOK, CAS, Exam, University, Study), STATUSES, PRIORITIES, WEEKDAYS, SUBJECT_COLORS, NAV_ITEMS.

import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Lightbulb,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import type { Priority, TaskStatus, TaskType, Weekday } from "@/types";

export const TASK_TYPES = [
  "IA",
  "EE",
  "TOK",
  "CAS",
  "Exam",
  "University",
  "Study",
] as const satisfies readonly TaskType[];

/** Task types only diploma students see */
export const DIPLOMA_ONLY_TASK_TYPES: readonly TaskType[] = ["EE", "TOK", "CAS"];

export const STATUSES = [
  "Not started",
  "In progress",
  "Completed",
] as const satisfies readonly TaskStatus[];

export const PRIORITIES = ["Low", "Medium", "High"] as const satisfies readonly Priority[];

/** Indexed by Weekday (0 = Sunday), matching study_days */
export const WEEKDAYS: { value: Weekday; short: string; long: string }[] = [
  { value: 0, short: "Sun", long: "Sunday" },
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
];

/** Display order for weekdays: Monday first, like the calendar */
export const WEEK_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only shown to diploma students */
  diplomaOnly: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, diplomaOnly: false },
  { label: "Schedule", href: "/schedule", icon: CalendarDays, diplomaOnly: false },
  { label: "Subjects", href: "/subjects", icon: BookOpen, diplomaOnly: false },
  { label: "EE", href: "/ee", icon: PenLine, diplomaOnly: true },
  { label: "TOK", href: "/tok", icon: Lightbulb, diplomaOnly: true },
  { label: "CAS", href: "/cas", icon: HeartHandshake, diplomaOnly: true },
  { label: "Universities", href: "/universities", icon: GraduationCap, diplomaOnly: false },
];
