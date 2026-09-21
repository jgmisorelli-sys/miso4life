-- Semeia o catálogo de exercícios com estimativas de kcal e preenche a
-- meta de kcal de cada sessão do plano semanal (seção 8). Seguro rodar
-- mais de uma vez (idempotente).
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'jgmisorelli@gmail.com';

  if v_user_id is null then
    raise exception 'Usuário não encontrado.';
  end if;

  insert into public.vida_exercicios_catalogo (user_id, nome, categoria, kcal_estimado, duracao_min_estimado)
  values
    (v_user_id, 'Circuito funcional (força)', 'forca', 250, 40),
    (v_user_id, 'Cardio leve (bike ou caminhada rápida)', 'aerobico', 200, 30),
    (v_user_id, 'Caminhada', 'aerobico', 150, 30),
    (v_user_id, 'Corrida', 'aerobico', 300, 30),
    (v_user_id, 'HIT', 'aerobico', 220, 25),
    (v_user_id, 'Esporte em família (beach tênis, bike)', 'esporte', 350, 60),
    (v_user_id, 'Mobilidade / alongamento', 'mobilidade', 50, 15),
    (v_user_id, 'Movimento de 15 minutos (semana pesada)', 'outro', 80, 15)
  on conflict (user_id, nome) do update set
    categoria = excluded.categoria,
    kcal_estimado = excluded.kcal_estimado,
    duracao_min_estimado = excluded.duracao_min_estimado;

  update public.vida_treinos_plano set kcal_estimado = 250 where user_id = v_user_id and dia_semana = 'segunda';
  update public.vida_treinos_plano set kcal_estimado = 200 where user_id = v_user_id and dia_semana = 'terca';
  update public.vida_treinos_plano set kcal_estimado = 50  where user_id = v_user_id and dia_semana = 'quarta';
  update public.vida_treinos_plano set kcal_estimado = 220 where user_id = v_user_id and dia_semana = 'quinta';
  update public.vida_treinos_plano set kcal_estimado = 250 where user_id = v_user_id and dia_semana = 'sexta';
  update public.vida_treinos_plano set kcal_estimado = 350 where user_id = v_user_id and dia_semana = 'sabado';
  update public.vida_treinos_plano set kcal_estimado = 150 where user_id = v_user_id and dia_semana = 'domingo';
end $$;
