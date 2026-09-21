# MISO4Life

Assistente pessoal para emagrecimento e qualidade de vida: controle de alimentação, água, café, exercícios físicos e aeróbicos, com importação de dietas e treinos gerados no Claude chat.

Faz parte do ecossistema MISO4Apps.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (componentes de UI próprios, estilo shadcn/ui)
- Supabase (Auth, Postgres, Row Level Security)
- React Router, Recharts
- PWA (vite-plugin-pwa) — instalável, com cache offline básico
- Vitest para testes

## Rodando localmente

```bash
npm install
npm run dev
```

Configure `.env.local` (não versionado) com as chaves do seu projeto Supabase e a chave pública VAPID (notificações push):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_VAPID_PUBLIC_KEY=
```

## Banco de dados

As migrations SQL estão em `supabase/`, numeradas em ordem de aplicação. Como este ambiente não tem acesso à service role/CLI do Supabase, aplique cada arquivo manualmente no **SQL Editor** do painel Supabase, na ordem numérica (001, 002, ...).

Todas as tabelas têm Row Level Security habilitada — cada usuário só acessa seus próprios dados.

## Importação de dietas e treinos

A tela **Meus Planos** aceita colar ou fazer upload de um JSON no formato definido em [`src/types/plan-import.ts`](src/types/plan-import.ts) e validado por [`src/lib/plan-parser.ts`](src/lib/plan-parser.ts). O prompt pronto para gerar esse JSON no Claude chat está em [`docs/prompt-importacao.md`](docs/prompt-importacao.md).

## Módulo Jornada (Plano 60 Dias)

Módulo de gamificação de hábitos (treino, passos, proteína, regra do prato, sono, horários), sob a rota `/jornada`, com sub-navegação própria em [`src/pages/jornada/JornadaLayout.tsx`](src/pages/jornada/JornadaLayout.tsx):

| Tela | O que faz |
|---|---|
| Hoje | Missões diárias, XP do dia, sequência, escudos, modo semana pesada |
| Semana | Missões semanais, treinos previstos vs. feitos, XP até 650 |
| Sprint | Sprint de 10 dias ativo, XP acumulado, próximo prêmio |
| Progresso | Gráficos (peso, % gordura, massa muscular, cintura), sugestão de ajuste de 14 dias, comparativo de fotos |
| Recompensas | Cofre do mês, resgate manual, lista de desejos |
| Conquistas | Selos concedidos automaticamente |
| Guia | Regras de porção, protocolo de evento social, catálogo de alimentos (calorias por porção) |
| Medir | Formulários de peso, cintura, bioimpedância, condicionamento e fotos |
| Configurações | Notificações, horários dos lembretes, família, canal WhatsApp, exportar/excluir dados |

**Arquitetura:**
- `supabase/007` a `027`: migrations aditivas do módulo (tabelas `vida_*`, todas com RLS por `user_id`).
- `src/lib/rules/`: motor de regras em funções puras (XP, sequência/escudos, sprint, recompensas, tendência de peso, cálculo de refeição), com testes Vitest.
- `src/lib/vida/`: integração desse motor com o Supabase (sincronização de sequência, recompensas, conquistas, exportação/exclusão de dados).
- `src/hooks/vida/`: um hook por tabela/necessidade de tela.

Todo valor de XP, meta ou regra de negócio vive nas tabelas de configuração (`vida_missoes_config`, `vida_recompensas_config`, `vida_lembretes_config`) — ajustar não exige deploy.

## Exportar e excluir dados

Na tela **Configurações**, qualquer usuário pode baixar uma cópia de tudo que o módulo guarda sobre ele (JSON ou um .zip de CSVs) e excluir permanentemente todos os seus dados do módulo (não afeta a conta nem o resto do miso4life). Ver [`src/lib/vida/dataExport.ts`](src/lib/vida/dataExport.ts) e [`src/lib/vida/dataDelete.ts`](src/lib/vida/dataDelete.ts).

## Lembretes por notificação push (módulo Jornada)

Notificações web push funcionam mesmo com o app fechado, via service worker
customizado (`src/sw.ts`) + uma Edge Function do Supabase acionada por
`pg_cron`. Passos pra ativar:

1. **Par de chaves VAPID** (já gerado nesta configuração inicial — se
   precisar gerar outro: `npx web-push generate-vapid-keys`). A chave
   pública vai em `VITE_VAPID_PUBLIC_KEY` (`.env.local` e nos build args do
   deploy); a chave privada **nunca** vai pro frontend nem pro git — só
   como secret da Edge Function.
2. **Deploy da função**: `supabase/functions/enviar-lembretes/`. Como este
   ambiente não tem a CLI do Supabase configurada, o deploy precisa ser
   feito por você (`supabase functions deploy enviar-lembretes`, ou pelo
   painel).
3. **Secrets da função** (Project Settings → Edge Functions → Secrets):
   `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`. `SUPABASE_URL` e
   `SUPABASE_SERVICE_ROLE_KEY` já existem automaticamente.
4. **Agendamento**: rode a migration `026_vida_pg_cron_lembretes.sql` no
   SQL Editor (tem instruções de pré-requisito no topo do arquivo — ativar
   as extensões `pg_cron` e `pg_net` antes).
5. Na tela **Configurações** do app, toque em "Ativar" notificações pra
   inscrever o navegador.

O canal WhatsApp tem só a interface pronta (`src/lib/vida/notifications/whatsappProvider.ts`) — o envio real depende de uma decisão de provedor, explicada na própria tela Configurações.

## Testes

```bash
npm run test
```

## Build e deploy

```bash
npm run build
```

Deploy no VPS via EasyPanel (Git source + Docker), seguindo o mesmo padrão de miso4slope/miso4dren:

- `Dockerfile` faz build multi-stage (Node → Nginx estático) e recebe `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_VAPID_PUBLIC_KEY` como build args.
- `nginx.conf` trata o roteamento de SPA (react-router).
- Domínio planejado: `life.miso4apps.com.br`.

### Checklist de deploy

- [ ] Todas as migrations `001` a `027` aplicadas no SQL Editor do Supabase, em ordem.
- [ ] Bucket `vida-fotos` existe no Storage (criado pela migration `014`) e está marcado como privado.
- [ ] Extensões `pg_cron` e `pg_net` ativas (Database → Extensions).
- [ ] `cron.schedule` da migration `026` configurado (`select * from cron.job` mostra `vida-enviar-lembretes`).
- [ ] Edge Function `enviar-lembretes` publicada.
- [ ] Secrets `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` configurados na Edge Function.
- [ ] No EasyPanel, variáveis de build `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_VAPID_PUBLIC_KEY` configuradas (a `VITE_VAPID_PUBLIC_KEY` é a mesma chave pública dos secrets acima).
- [ ] `npm run test` e `npm run build` passando localmente antes de subir.
- [ ] Domínio `life.miso4apps.com.br` apontado no DNS e serviço criado no EasyPanel.
- [ ] Backups do Supabase revisados — no plano Free não há backup automático; considerar exportar os dados periodicamente (tela Configurações) até decidir sobre upgrade de plano.
