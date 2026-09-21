// Edge Function acionada por pg_cron a cada 5 minutos (ver migration 026).
// Lê os lembretes configurados, checa se o horário bate com "agora" no
// fuso America/Sao_Paulo, aplica as condições de cada tipo (ex: janela de
// treino só dispara se o treino ainda não foi marcado) e manda a
// notificação push pra cada assinatura do usuário.
//
// Segredos necessários (Supabase → Project Settings → Edge Functions →
// Secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, SUPABASE_URL e
// SUPABASE_SERVICE_ROLE_KEY (os dois últimos já existem automaticamente
// em todo projeto Supabase).
import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!

webpush.setVapidDetails('mailto:contato@miso4apps.com.br', vapidPublicKey, vapidPrivateKey)

const supabase = createClient(supabaseUrl, serviceRoleKey)

type LembreteTipo = 'manha' | 'janela_treino' | 'fechamento_dia' | 'resumo_semana' | 'pre_bioimpedancia'

// Mensagens curtas e acolhedoras, sem peso/medidas/percentuais no corpo
// (seção 14 -- dados de saúde nunca vão em notificação).
const MENSAGENS: Record<LembreteTipo, { title: string; body: string; url: string }> = {
  manha: { title: 'Bom dia!', body: 'Sua missão do dia está pronta.', url: '/jornada' },
  janela_treino: { title: 'Janela de treino', body: 'Ainda dá tempo de treinar hoje.', url: '/jornada' },
  fechamento_dia: { title: 'Fechamento do dia', body: 'Confira seu XP e o mínimo de 5 minutos.', url: '/jornada' },
  resumo_semana: { title: 'Resumo da semana', body: 'Veja como foi sua semana na Jornada.', url: '/jornada/semana' },
  pre_bioimpedancia: {
    title: 'Lembrete de bioimpedância',
    body: 'Pela manhã, em jejum, sem treino nas últimas 12h.',
    url: '/jornada/medir',
  },
}

function horaAtualSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

function dataAtualSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

function diaDaSemanaSaoPaulo(): number {
  const texto = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' }).format(
    new Date(),
  )
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(texto)
}

async function deveEnviar(userId: string, tipo: LembreteTipo, hoje: string): Promise<boolean> {
  if (tipo === 'resumo_semana') return diaDaSemanaSaoPaulo() === 0 // domingo

  if (tipo === 'janela_treino') {
    const { data } = await supabase
      .from('vida_treinos_feitos')
      .select('id')
      .eq('user_id', userId)
      .eq('data', hoje)
      .limit(1)
    return (data?.length ?? 0) === 0 // só manda se ainda não treinou hoje
  }

  if (tipo === 'pre_bioimpedancia') {
    const { data } = await supabase
      .from('vida_medidas')
      .select('data')
      .eq('user_id', userId)
      .eq('tipo', 'bioimpedancia')
      .order('data', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!data) return false
    const proximaData = new Date(`${data.data}T00:00:00`)
    proximaData.setDate(proximaData.getDate() + 14)
    return proximaData.toISOString().slice(0, 10) === hoje
  }

  return true // manha, fechamento_dia: só depende do horário/ativo
}

Deno.serve(async () => {
  const horaAtual = horaAtualSaoPaulo()
  const hoje = dataAtualSaoPaulo()

  const { data: lembretes, error } = await supabase
    .from('vida_lembretes_config')
    .select('id, user_id, tipo, horario, ativo')
    .eq('ativo', true)
    .eq('canal', 'push')

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const paraEnviar = (lembretes ?? []).filter((lembrete) => {
    if (lembrete.tipo === 'resumo_semana') return true // horário checado dentro de deveEnviar via dia
    return lembrete.horario?.slice(0, 5) === horaAtual
  })

  let enviados = 0

  for (const lembrete of paraEnviar) {
    const tipo = lembrete.tipo as LembreteTipo
    if (tipo === 'resumo_semana' && lembrete.horario?.slice(0, 5) !== horaAtual) continue

    const pode = await deveEnviar(lembrete.user_id, tipo, hoje)
    if (!pode) continue

    const { data: subscriptions } = await supabase
      .from('vida_push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', lembrete.user_id)

    const mensagem = MENSAGENS[tipo]
    for (const sub of subscriptions ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(mensagem),
        )
        enviados++
      } catch (err) {
        console.error('Falha ao enviar push', err)
      }
    }
  }

  return new Response(JSON.stringify({ enviados }), { headers: { 'Content-Type': 'application/json' } })
})
