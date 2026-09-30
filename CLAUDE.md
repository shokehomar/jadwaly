# jadwaly

## What this is
A study planner web app for IB students. Students set up their subjects and how much they want to study each one per week, and the app builds their study schedule and tracks deadlines, IAs, EE, TOK, and CAS.

Primary user: IB students (diploma and non-diploma). The builder's sister is an IB student and the main source of product feedback.

## Current phase
Preparing for the first deploy to Vercel, still on development Clerk keys (a production Clerk instance needs our own domain; not set up yet).

Done so far:
1. UI and navigation
2. Scheduling algorithm (`lib/study-plan.ts`), with Vitest tests
3. Onboarding flow, saved through the `save_onboarding` Postgres function
4. Clerk auth and Supabase (schema, RLS, and functions in `supabase/schema.sql`)
5. All writes through server actions in `lib/actions/`; the data provider updates the screen immediately and undoes a change if its save fails
6. Settings page (profile, subjects, extracurriculars)

How data flows: `app/(app)/layout.tsx` loads the signed-in user's rows from Supabase (`lib/user-data.ts`) and passes them to the data provider. Components read and write only through `useData()`, never Supabase directly. `constants/mock-data.ts` is for tests only.

## Stack
- Next.js 16, App Router, TypeScript, no `src/` directory
- Tailwind CSS
- shadcn/ui for components (add via `npx shadcn add <component>`, do not hand-write files in `components/ui/`)
- Clerk (auth), Supabase (Postgres); Vercel (hosting) next
- Note: Next.js 16 uses `proxy.ts`, not `middleware.ts`. `proxy.ts` runs Clerk's route protection: every route except sign-in and sign-up requires sign-in.

## Folder structure
Each skeleton file starts with a comment describing its purpose and what it connects to. Read it before writing the file, and keep to that purpose.
- `app/(app)/` signed-in pages sharing the sidebar layout
- `app/(auth)/` sign-in and sign-up (later)
- `app/onboarding/` onboarding flow (later)
- `components/` grouped by feature: layout, dashboard, subjects, tasks, onboarding
- `lib/study-plan.ts` scheduling logic as pure functions, no UI or database code inside
- `lib/actions/` server actions: every write goes through one, called by the data provider
- `constants/` static data, and mock data used only by tests
- `types/` shared TypeScript types

## Data model
profiles
- id (text, Clerk user ID), name, graduation_year (int), diploma (boolean), onboarding_complete (boolean)
- diploma = false means a non-diploma student: no CAS, EE, or TOK pages, and they may take fewer than 6 subjects. Never assume exactly 6 subjects.

subjects
- id, user_id, name, level (HL or SL), color (hex), predicted_grade (1 to 7, optional)
- Study plan: session_minutes (int), study_days (array of 0 to 6, 0 = Sunday), priority (High, Medium, Low; default Medium)
- Onboarding offers frequency presets (every day, every other day, weekends, custom) that all save as study_days.

profiles also has daily_cap_minutes (int, default 240).
profiles also has weekend_days (array of 0 to 6, default [5, 6] for Friday and Saturday). For now every student gets Friday and Saturday (production targets Jordan) and onboarding does not ask; a way to change it may come later. The "Weekends" preset and label always use the student's weekend_days, never hardcoded days.

tasks
- id, user_id, subject_id (optional), title, type (IA, EE, TOK, CAS, Exam, University, Study), due_date, status (Not started, In progress, Completed), priority (Low, Medium, High), notes (optional)
- There is no Homework type. IB students here mostly work on long-running assessments, not daily homework.
tasks: type Test is renamed to Exam. Exams are tasks with type Exam and a subject.

extracurriculars
- id, user_id, name, days (array of 0 to 6), start_time (HH:MM), duration_minutes

study_logs (a study session marked done)
- id, user_id, subject_id, date, minutes

assessments
- id, user_id, subject_id, name, date, score, max_score

## Scheduling (lib/study-plan.ts)
Pure functions only. Main function: generateWeek(weekStart, today, profile, subjects, tasks, studyLogs) returns, for each day Monday to Sunday, a list of sessions { subjectId, minutes, reason: "regular" | "exam prep" | "carried over" } plus a list of sessions that couldn't fit.
Constants: EXAM_PREP_DAYS = 3, EXAM_PREP_MINUTES = 60.

Rules, in order:
1. Base plan: each subject gets a session of session_minutes on each of its study_days.
2. Exam prep: for each Exam task that isn't completed, add EXAM_PREP_MINUTES for that subject on each of the EXAM_PREP_DAYS days before the exam.
3. Missed sessions: sessions on days before today with no matching study_log are missed.
4. Daily cap: from today onward, if a day exceeds daily_cap_minutes, remove sessions lowest priority first until it fits. Never remove exam prep.
5. Reschedule: missed and removed sessions, highest priority first, go to the earliest day from today to Sunday with room. If the subject has an upcoming exam, the session must land before the exam date.
6. Anything that still doesn't fit goes in the "couldn't fit" list. Never drop a session silently.
Sessions have no set times. Extracurriculars are shown on their days and hidden on days with an exam.


Milestones: IA, EE, and TOK milestones are regular tasks. An IA milestone is a task with type IA and the subject set; EE and TOK milestones use those types. Order milestones by due date.

Planned but not designed yet: extracurriculars (blocked time the scheduler must work around), CAS, university applications.

## Design
- Font: Space Grotesk (via next/font)
- Colors: primary #62AD59, text #515151, surface #F3F3F3, plus one distinct color per subject used consistently (cards, calendar, tags)
- Layout: left sidebar navigation, main content area, cards for sections
- Clean and calm, generous whitespace, fully responsive (students mostly use phones)
- Copy is plain and direct. No emojis in the UI.

## How to work
- Work step by step. Do one task at a time and stop when it is done. Do not build extra features or pages that were not asked for.
- If a request is ambiguous, ask before writing code.
- Keep components small and in the folder their skeleton comment specifies.
- Use TypeScript types from `types/` everywhere; no `any`.
- After finishing a task, summarize which files changed and how to check the result in the browser.

## Known issues (fix before launch)
- Predicted total shows out of 42; EE/TOK core points (0 to 3) aren't stored yet.
- Deployed on development Clerk keys and a vercel.app URL. Before opening to other students: buy a domain, create a Clerk production instance (redo phone sign-in off, Supabase integration, own Google OAuth), add its domain to Supabase third-party auth, and decide whether production gets its own Supabase project.