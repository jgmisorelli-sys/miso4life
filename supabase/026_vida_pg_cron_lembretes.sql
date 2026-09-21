-- Agenda a Edge Function de lembretes pra rodar a cada 5 minutos.
--
-- ANTES DE RODAR:
-- 1. No painel Supabase, vá em Database → Extensions e ative "pg_cron" e
--    "pg_net" (procure pelo nome, clique em Enable).
-- 2. Faça o deploy da função (supabase/functions/enviar-lembretes) e
--    configure os secrets VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY em
--    Project Settings → Edge Functions → Secrets.
-- 3. Troque SUA_SERVICE_ROLE_KEY_AQUI abaixo pela Service Role Key do
--    projeto (Project Settings → API → service_role). Essa chave é
--    secreta -- não a deixe em nenhum arquivo versionado; cole só aqui,
--    direto no SQL Editor, e rode.

select cron.schedule(
  'vida-enviar-lembretes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://tbfufwdocbauhivysbcj.supabase.co/functions/v1/enviar-lembretes',
    headers := jsonb_build_object(
      'Authorization', 'Bearer SUA_SERVICE_ROLE_KEY_AQUI',
      'Content-Type', 'application/json'
    )
  );
  $$
);

-- Pra conferir se está agendado: select * from cron.job;
-- Pra remover, se precisar: select cron.unschedule('vida-enviar-lembretes');
