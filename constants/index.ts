// Static data: IB_SUBJECTS (by group), TASK_TYPES (IA, EE, TOK, CAS, Test, University, Study), STATUSES, PRIORITIES, WEEKDAYS, SUBJECT_COLORS, NAV_ITEMS.

import {
  BookOpen,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Lightbulb,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import type { Priority, TaskStatus, TaskType } from "@/types";

export const TASK_TYPES = [
  "IA",
  "EE",
  "TOK",
  "CAS",
  "Test",
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

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only shown to diploma students */
  diplomaOnly: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, diplomaOnly: false },
  { label: "Subjects", href: "/subjects", icon: BookOpen, diplomaOnly: false },
  { label: "EE", href: "/ee", icon: PenLine, diplomaOnly: true },
  { label: "TOK", href: "/tok", icon: Lightbulb, diplomaOnly: true },
  { label: "CAS", href: "/cas", icon: HeartHandshake, diplomaOnly: true },
  { label: "Universities", href: "/universities", icon: GraduationCap, diplomaOnly: false },
];
