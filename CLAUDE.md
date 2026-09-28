# jadwaly

## What this is
A study planner web app for IB students. Students set up their subjects and how much they want to study each one per week, and the app builds their study schedule and tracks deadlines, IAs, EE, TOK, and CAS.

Primary user: IB students (diploma and non-diploma). The builder's sister is an IB student and the main source of product feedback.

## Current phase
Phase 1: UI with mock data. No database, no auth yet.
All data comes from `constants/mock-data.ts`, shaped exactly like the future database (see Data model). Components must not assume where data comes from, so it can later be swapped for Supabase without rewriting UI.

Planned order:
1. UI and navigation with mock data
2. Scheduling algorithm (`lib/study-plan.ts`)
3. Onboarding flow
4. Database (Supabase) and auth (Clerk)

## Stack
- Next.js 16, App Router, TypeScript, no `src/` directory
- Tailwind CSS
- shadcn/ui for components (add via `npx shadcn add <component>`, do not hand-write files in `components/ui/`)
- Later: Clerk (auth), Supabase (Postgres), Vercel (hosting)
- Note: Next.js 16 uses `proxy.ts`, not `middleware.ts`. `proxy.ts.todo` is a placeholder; leave it alone until auth is set up.

## Folder structure
Each skeleton file starts with a comment describing its purpose and what it connects to. Read it before writing the file, and keep to that purpose.
- `app/(app)/` signed-in pages sharing the sidebar layout
- `app/(auth)/` sign-in and sign-up (later)
- `app/onboarding/` onboarding flow (later)
- `components/` grouped by feature: layout, dashboard, subjects, tasks, onboarding
- `lib/study-plan.ts` scheduling logic as pure functions, no UI or database code inside
- `lib/actions/` server actions (later, once the database exists)
- `constants/` static data and mock data
- `types/` shared TypeScript types

## Data model
profiles
- id (text, Clerk user ID), name, graduation_year (int), diploma (boolean), onboarding_complete (boolean)
- diploma = false means a non-diploma student: no CAS, EE, or TOK pages, and they may take fewer than 6 subjects. Never assume exactly 6 subjects.

subjects
- id, user_id, name, level (HL or SL), color (hex), predicted_grade (1 to 7, optional)
- Study plan lives on the subject: min_hours_week, max_hours_week, study_days (array of 0 to 6, 0 = Sunday)

tasks
- id, user_id, subject_id (optional), title, type (IA, EE, TOK, CAS, Test, University, Study), due_date, status (Not started, In progress, Completed), priority (Low, Medium, High), notes (optional)
- There is no Homework type. IB students here mostly work on long-running assessments, not daily homework.

assessments
- id, user_id, subject_id, name, date, score, max_score

Undecided: whether IA, EE, and TOK milestones are regular tasks or a separate table. Ask before building anything that depends on this.
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