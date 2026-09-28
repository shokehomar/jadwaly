import { WEEK_ORDER, WEEKDAYS } from "@/constants"
import type { Weekday } from "@/types"

export { cn } from "cn"

// Dates are stored as "YYYY-MM-DD" strings. Parse them as local dates so a
// due date never shifts by a day because of the time zone.
function parseDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/** Today as "YYYY-MM-DD" in the user's time zone */
export function todayString(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

/** "2026-10-09" -> "Fri, 9 Oct" */
export function formatDueDate(date: string): string {
  return parseDate(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

export function isOverdue(dueDate: string): boolean {
  return dueDate < todayString()
}

/** addDays("2026-09-28", 6) -> "2026-10-04" */
export function addDays(date: string, days: number): string {
  const result = parseDate(date)
  result.setDate(result.getDate() + days)
  const month = String(result.getMonth() + 1).padStart(2, "0")
  const day = String(result.getDate()).padStart(2, "0")
  return `${result.getFullYear()}-${month}-${day}`
}

/** Sort compare: earliest due date first */
export function byDueDate(a: { due_date: string }, b: { due_date: string }): number {
  return a.due_date.localeCompare(b.due_date)
}

/** 45 -> "45 min"; 60 -> "1 h"; 630 -> "10 h 30 min" */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

/** Study days as text: "Every day", "Weekends", or "Mon, Wed, Fri" (Monday first) */
export function describeStudyDays(days: Weekday[]): string {
  const unique = new Set(days)
  if (unique.size === 0) return "No study days"
  if (unique.size === 7) return "Every day"
  if (unique.size === 2 && unique.has(0) && unique.has(6)) return "Weekends"
  return WEEK_ORDER.filter((d) => unique.has(d))
    .map((d) => WEEKDAYS[d].short)
    .join(", ")
}

/** Whole days from today until `date`: 0 = today, 1 = tomorrow, negative = past */
export function daysUntil(date: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  // Math.round absorbs the one-hour shift on daylight saving changes
  return Math.round((parseDate(date).getTime() - parseDate(todayString()).getTime()) / msPerDay)
}
