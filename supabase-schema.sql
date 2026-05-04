-- ================================================
-- Backcast MVP — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL)
-- ================================================

-- 1. Profiles table (one row per user)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  age integer check (age > 0 and age <= 120),
  sex text check (sex in ('male', 'female')),
  weight integer check (weight > 0 and weight <= 1000),
  target_age integer default 80 check (target_age >= 70 and target_age <= 120),
  activity_level text default 'active' check (activity_level in ('active', 'sedentary')),
  selected_goals text[] default '{}',
  custom_targets jsonb default '{}',
  has_onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Migration for existing databases (safe to re-run):
alter table profiles add column if not exists activity_level text default 'active'
  check (activity_level in ('active', 'sedentary'));

-- 2. Workout logs table
create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  value numeric not null check (value > 0 and value <= 10000),
  logged_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create index if not exists idx_workout_logs_user_id on workout_logs(user_id);
create index if not exists idx_workout_logs_exercise on workout_logs(user_id, exercise_id);

-- 3. Row-Level Security
alter table profiles enable row level security;
alter table workout_logs enable row level security;

-- Profiles: users can only read/write their own row
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Workout logs: users can only CRUD their own logs
create policy "Users can view own logs"
  on workout_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on workout_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on workout_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own logs"
  on workout_logs for delete
  using (auth.uid() = user_id);

-- 4. Auto-update updated_at on profiles
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();
