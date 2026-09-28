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
