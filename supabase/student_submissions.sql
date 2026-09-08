-- Run in the DeutschYatra project's Supabase SQL Editor.
create table if not exists public.student_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  email text not null check (char_length(trim(email)) between 3 and 320),
  phone text not null check (char_length(trim(phone)) between 7 and 30),
  degree_goal text not null check (degree_goal in ('bachelor', 'master')),
  academic_stage text not null check (char_length(trim(academic_stage)) between 2 and 120),
  preferred_language text not null check (char_length(trim(preferred_language)) between 2 and 80),
  consent_given boolean not null default false check (consent_given is true),
  source_page text,
  profile_snapshot jsonb not null default '{}'::jsonb
);

alter table public.student_submissions enable row level security;
grant insert on table public.student_submissions to anon;
create policy "Visitors can submit their own enquiry"
  on public.student_submissions for insert to anon
  with check (consent_given is true);
-- No public SELECT, UPDATE or DELETE policy: enquiries stay private.
