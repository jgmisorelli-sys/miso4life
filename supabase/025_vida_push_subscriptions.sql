-- Assinaturas de push do navegador (Web Push). Cada dispositivo/navegador
-- que aceita notificações gera uma. A Edge Function de lembretes lê essa
-- tabela pra saber pra onde mandar cada notificação.
create table if not exists public.vida_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.vida_push_subscriptions enable row level security;

create policy "vida_push_subscriptions_own"
  on public.vida_push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
