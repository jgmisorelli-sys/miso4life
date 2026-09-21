-- Campo auxiliar para o motor de regras saber se o dia imediatamente anterior
-- já tinha falhado, e assim detectar corretamente "dois dias seguidos sem
-- fazer nada" (a regra central de anti-abandono).
alter table public.vida_streak
  add column if not exists dia_anterior_falhou boolean not null default false;
