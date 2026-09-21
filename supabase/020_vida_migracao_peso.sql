-- Migra o histórico de peso/cintura/quadril de body_logs (app antigo) para
-- vida_medidas (tipo 'peso'), preservando os dados originais em body_logs
-- (nada é apagado). Cintura semanal específica do novo módulo pode ser
-- registrada separadamente como tipo 'cintura' a partir de agora.
insert into public.vida_medidas (user_id, data, tipo, valores, created_at)
select
  user_id,
  logged_at,
  'peso',
  jsonb_strip_nulls(jsonb_build_object(
    'peso_kg', weight_kg,
    'gordura_pct', body_fat_pct,
    'cintura_cm', waist_cm,
    'quadril_cm', hip_cm
  )),
  created_at
from public.body_logs
on conflict (user_id, data, tipo) do nothing;
