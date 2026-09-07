create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists diet_plans_user_idx on public.diet_plans (user_id);

alter table public.diet_plans enable row level security;

create policy "Users manage their own diet plans"
  on public.diet_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.diet_plan_items (
  id uuid primary key default gen_random_uuid(),
  diet_plan_id uuid not null references public.diet_plans (id) on delete cascade,
  day_of_week text not null check (
    day_of_week in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
  ),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'snack', 'dinner', 'extra')),
  food_name text not null,
  quantity text,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  order_index integer not null default 0
);

create index if not exists diet_plan_items_plan_idx on public.diet_plan_items (diet_plan_id, day_of_week);

alter table public.diet_plan_items enable row level security;

create policy "Users manage items of their own diet plans"
  on public.diet_plan_items for all
  using (
    exists (
      select 1 from public.diet_plans dp
      where dp.id = diet_plan_id and dp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.diet_plans dp
      where dp.id = diet_plan_id and dp.user_id = auth.uid()
    )
  );

-- Only one active diet plan per user at a time.
create unique index if not exists diet_plans_one_active_per_user
  on public.diet_plans (user_id)
  where is_active;
