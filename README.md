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

Configure `.env.local` (não versionado) com as chaves do seu projeto Supabase:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Banco de dados

As migrations SQL estão em `supabase/`, numeradas em ordem de aplicação. Como este ambiente não tem acesso à service role/CLI do Supabase, aplique cada arquivo manualmente no **SQL Editor** do painel Supabase, na ordem numérica (001, 002, ...).

Todas as tabelas têm Row Level Security habilitada — cada usuário só acessa seus próprios dados.

## Importação de dietas e treinos

A tela **Meus Planos** aceita colar ou fazer upload de um JSON no formato definido em [`src/types/plan-import.ts`](src/types/plan-import.ts) e validado por [`src/lib/plan-parser.ts`](src/lib/plan-parser.ts). O prompt pronto para gerar esse JSON no Claude chat está em [`docs/prompt-importacao.md`](docs/prompt-importacao.md).

## Testes

```bash
npm run test
```

## Build e deploy

```bash
npm run build
```

Deploy no VPS via EasyPanel (Git source + Docker), seguindo o mesmo padrão de miso4slope/miso4dren:

- `Dockerfile` faz build multi-stage (Node → Nginx estático) e recebe `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` como build args.
- `nginx.conf` trata o roteamento de SPA (react-router).
- Domínio planejado: `life.miso4apps.com.br`.
