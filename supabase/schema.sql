-- jadwaly database schema for Supabase (Postgres 15 or later).
-- Tables match types/index.d.ts, plus a created_at column on every table (not in
-- the TypeScript types). Run once on a fresh project, in the SQL editor.
--
-- Auth: Clerk through Supabase's third-party auth. The Clerk user ID arrives
-- as the JWT "sub" claim and is read with auth.jwt()->>'sub' (Clerk's Supabase
-- guide). user_id columns default to it, and every table has row level security
-- so a signed-in user can only see and change their own rows.
--
-- Deletes follow the data provider (components/providers/DataProvider.tsx):
--   subject deleted -> its tasks keep existing with subject_id cleared,
--                      its assessments and study logs are deleted
--   profile deleted -> everything that user owns is deleted

begin;

-- ---------------------------------------------------------------------------
-- profiles: one row per student, keyed by the Clerk user ID.
-- The row is created when onboarding finishes, so name, graduation_year, and
-- diploma are required. No row means the student hasn't onboarded yet.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id text primary key default (auth.jwt()->>'sub'),
  name text not null check (char_length(trim(name)) between 1 and 50),
  graduation_year integer not null check (graduation_year between 2000 and 2100),
  diploma boolean not null,
  onboarding_complete boolean not null default false,
  daily_cap_minutes integer not null default 240 check (daily_cap_minutes between 1 and 1440),
  weekend_days smallint[] not null default '{5,6}'
    check (weekend_days <@ '{0,1,2,3,4,5,6}' and array_position(weekend_days, null) is null),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- subjects: a student's subjects with their study plan.
-- unique (id, user_id) lets tasks, assessments, and study logs point at a
-- subject *and* its owner, so no row can reference another user's subject.
-- ---------------------------------------------------------------------------
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt()->>'sub')
    references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  level text not null check (level in ('HL', 'SL')),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  predicted_grade smallint check (predicted_grade between 1 and 7),
  session_minutes integer not null check (session_minutes between 1 and 1440),
  -- 0 = Sunday ... 6 = Saturday; may be empty (only exam prep is scheduled)
  study_days smallint[] not null default '{}'
    check (study_days <@ '{0,1,2,3,4,5,6}' and array_position(study_days, null) is null),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create index subjects_user_id_idx on public.subjects (user_id);

-- ---------------------------------------------------------------------------
-- tasks: deadlines and work (IA, EE, TOK, CAS, Exam, University, Study).
-- IA, EE, and TOK milestones are regular tasks. subject_id is optional.
-- Deleting a subject clears subject_id and keeps the task (set null on the
-- subject_id column only, so user_id is untouched).
-- Exams should have a subject, but that is checked in the app, not here:
-- deleting a subject would otherwise be blocked by its exams.
-- ---------------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt()->>'sub')
    references public.profiles (id) on delete cascade,
  subject_id uuid,
  title text not null check (char_length(trim(title)) between 1 and 120),
  type text not null check (type in ('IA', 'EE', 'TOK', 'CAS', 'Exam', 'University', 'Study')),
  due_date date not null,
  status text not null default 'Not started'
    check (status in ('Not started', 'In progress', 'Completed')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  foreign key (subject_id, user_id) references public.subjects (id, user_id)
    on delete set null (subject_id)
);

create index tasks_user_id_due_date_idx on public.tasks (user_id, due_date);
create index tasks_subject_id_idx on public.tasks (subject_id);

-- ---------------------------------------------------------------------------
-- assessments: past results for a subject. Deleted with their subject.
-- ---------------------------------------------------------------------------
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt()->>'sub')
    references public.profiles (id) on delete cascade,
  subject_id uuid not null,
  name text not null check (char_length(trim(name)) between 1 and 120),
  date date not null,
  score numeric not null check (score >= 0),
  max_score numeric not null check (max_score > 0),
  created_at timestamptz not null default now(),
  foreign key (subject_id, user_id) references public.subjects (id, user_id)
    on delete cascade
);

create index assessments_user_id_idx on public.assessments (user_id);
create index assessments_subject_id_idx on public.assessments (subject_id);

-- ---------------------------------------------------------------------------
-- extracurriculars: fixed weekly commitments (gym, clubs). At least one day.
-- start_time is text "HH:MM" to match the app; a Postgres time column would
-- come back as "18:00:00".
-- ---------------------------------------------------------------------------
create table public.extracurriculars (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt()->>'sub')
    references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  days smallint[] not null
    check (
      cardinality(days) >= 1
      and days <@ '{0,1,2,3,4,5,6}'
      and array_position(days, null) is null
    ),
  start_time text not null check (start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  created_at timestamptz not null default now()
);

create index extracurriculars_user_id_idx on public.extracurriculars (user_id);

-- ---------------------------------------------------------------------------
-- study_logs: a study session marked done. Deleted with their subject.
-- ---------------------------------------------------------------------------
create table public.study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt()->>'sub')
    references public.profiles (id) on delete cascade,
  subject_id uuid not null,
  date date not null,
  minutes integer not null check (minutes between 1 and 1440),
  created_at timestamptz not null default now(),
  foreign key (subject_id, user_id) references public.subjects (id, user_id)
    on delete cascade
);

create index study_logs_user_id_date_idx on public.study_logs (user_id, date);
create index study_logs_subject_id_idx on public.study_logs (subject_id);

-- ---------------------------------------------------------------------------
-- Row level security. One policy per table covers select, insert, update, and
-- delete for signed-in users (the "authenticated" role):
--   using      -> which existing rows they can see, update, or delete
--   with check -> what a row may look like after insert or update
-- Both require the row's owner to be the Clerk user in the JWT. Anonymous
-- requests match no policy, so they see nothing and can write nothing.
-- (select auth.jwt()->>'sub') is wrapped in a select so Postgres evaluates it
-- once per query instead of once per row.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.tasks enable row level security;
alter table public.assessments enable row level security;
alter table public.extracurriculars enable row level security;
alter table public.study_logs enable row level security;

create policy "Users manage their own profile" on public.profiles
  for all to authenticated
  using ((select auth.jwt()->>'sub') = id)
  with check ((select auth.jwt()->>'sub') = id);

create policy "Users manage their own subjects" on public.subjects
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "Users manage their own tasks" on public.tasks
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "Users manage their own assessments" on public.assessments
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "Users manage their own extracurriculars" on public.extracurriculars
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "Users manage their own study logs" on public.study_logs
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

commit;
