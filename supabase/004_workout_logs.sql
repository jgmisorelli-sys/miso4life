create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_type text not null check (workout_type in ('strength', 'aerobic')),
  exercise_name text not null,
  sets integer,
  reps text,
  weight_kg numeric,
  duration_min integer,
  distance_km numeric,
  calories integer,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists workout_logs_user_logged_at_idx
  on public.workout_logs (user_id, logged_at desc);

alter table public.workout_logs enable row level security;

create policy "Users manage their own workout logs"
  on public.workout_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
