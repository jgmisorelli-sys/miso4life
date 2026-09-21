import { supabase } from '@/lib/supabase'

const CONQUISTAS: { codigo: string; nome: string }[] = [
  { codigo: 'primeira_semana_completa', nome: 'Primeira semana completa' },
  { codigo: 'sequencia_7_dias', nome: '7 dias de sequência' },
  { codigo: 'sequencia_14_dias', nome: '14 dias de sequência' },
  { codigo: 'sequencia_30_dias', nome: '30 dias de sequência' },
  { codigo: 'primeiro_sprint_concluido', nome: 'Primeiro sprint concluído' },
  { codigo: 'primeiro_evento_social_vencido', nome: 'Primeiro evento social vencido' },
  { codigo: 'primeiro_chefe_derrotado', nome: 'Primeiro chefe derrotado' },
]

async function conceder(userId: string, codigo: string) {
  const nome = CONQUISTAS.find((c) => c.codigo === codigo)?.nome ?? codigo
  await supabase
    .from('vida_conquistas')
    .upsert(
      { user_id: userId, codigo, nome, data_conquista: new Date().toISOString().slice(0, 10) },
      { onConflict: 'user_id,codigo', ignoreDuplicates: true },
    )
}

/**
 * Verifica o estado atual do usuário e concede qualquer selo que ainda não
 * tenha sido dado. Idempotente -- seguro rodar toda vez que a tela de
 * Conquistas é aberta.
 */
export async function sincronizarConquistas(userId: string) {
  const [streak, semana7Minimos, sprintConcluido, eventoVencido, chefeDerrotado] = await Promise.all([
    supabase.from('vida_streak').select('recorde').eq('user_id', userId).maybeSingle(),
    supabase
      .from('vida_missoes_feitas')
      .select('id')
      .eq('user_id', userId)
      .eq('missao_codigo', 'semana_7_minimos')
      .limit(1),
    supabase.from('vida_sprints').select('id').eq('user_id', userId).eq('status', 'concluida').limit(1),
    supabase
      .from('vida_eventos_sociais')
      .select('id')
      .eq('user_id', userId)
      .eq('cumprido', true)
      .limit(1),
    supabase
      .from('vida_medidas')
      .select('id')
      .eq('user_id', userId)
      .eq('tipo', 'condicionamento')
      .ilike('observacao', '%chefe%')
      .limit(1),
  ])

  const recorde = streak.data?.recorde ?? 0
  const concessoes: Promise<void>[] = []

  if ((semana7Minimos.data?.length ?? 0) > 0) concessoes.push(conceder(userId, 'primeira_semana_completa'))
  if (recorde >= 7) concessoes.push(conceder(userId, 'sequencia_7_dias'))
  if (recorde >= 14) concessoes.push(conceder(userId, 'sequencia_14_dias'))
  if (recorde >= 30) concessoes.push(conceder(userId, 'sequencia_30_dias'))
  if ((sprintConcluido.data?.length ?? 0) > 0) concessoes.push(conceder(userId, 'primeiro_sprint_concluido'))
  if ((eventoVencido.data?.length ?? 0) > 0) concessoes.push(conceder(userId, 'primeiro_evento_social_vencido'))
  if ((chefeDerrotado.data?.length ?? 0) > 0) concessoes.push(conceder(userId, 'primeiro_chefe_derrotado'))

  await Promise.all(concessoes)
}
