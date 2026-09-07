create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists workout_plans_user_idx on public.workout_plans (user_id);

alter table public.workout_plans enable row level security;

create policy "Users manage their own workout plans"
  on public.workout_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create unique index if not exists workout_plans_one_active_per_user
  on public.workout_plans (user_id)
  where is_active;

create table if not exists public.workout_plan_days (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references public.workout_plans (id) on delete cascade,
  label text not null,
  order_index integer not null default 0
);

create index if not exists workout_plan_days_plan_idx on public.workout_plan_days (workout_plan_id);

alter table public.workout_plan_days enable row level security;

create policy "Users manage days of their own workout plans"
  on public.workout_plan_days for all
  using (
    exists (
      select 1 from public.workout_plans wp
      where wp.id = workout_plan_id and wp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_plans wp
      where wp.id = workout_plan_id and wp.user_id = auth.uid()
    )
  );

create table if not exists public.workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_plan_day_id uuid not null references public.workout_plan_days (id) on delete cascade,
  name text not null,
  sets integer,
  reps text,
  notes text,
  order_index integer not null default 0
);

create index if not exists workout_plan_exercises_day_idx
  on public.workout_plan_exercises (workout_plan_day_id);

alter table public.workout_plan_exercises enable row level security;

create policy "Users manage exercises of their own workout plans"
  on public.workout_plan_exercises for all
  using (
    exists (
      select 1 from public.workout_plan_days wpd
      join public.workout_plans wp on wp.id = wpd.workout_plan_id
      where wpd.id = workout_plan_day_id and wp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_plan_days wpd
      join public.workout_plans wp on wp.id = wpd.workout_plan_id
      where wpd.id = workout_plan_day_id and wp.user_id = auth.uid()
    )
  );
