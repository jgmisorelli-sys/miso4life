import { supabase } from '@/lib/supabase'
import { avaliarRecompensaPorXpMinimo, avaliarRecompensaSemanal } from '@/lib/rules'
import type { Database } from '@/types/database'

type RecompensaConfigRow = Database['public']['Tables']['vida_recompensas_config']['Row']

async function buscarConfig(userId: string, gatilho: string): Promise<RecompensaConfigRow | null> {
  const { data } = await supabase
    .from('vida_recompensas_config')
    .select('*')
    .eq('user_id', userId)
    .eq('gatilho', gatilho)
    .eq('ativa', true)
    .maybeSingle()
  return data
}

async function garantirRecompensa(
  userId: string,
  config: RecompensaConfigRow,
  referenciaTipo: string,
  referenciaId: string,
) {
  await supabase
    .from('vida_recompensas')
    .upsert(
      {
        user_id: userId,
        recompensa_config_id: config.id,
        referencia_tipo: referenciaTipo,
        referencia_id: referenciaId,
        estado: 'disponivel',
        valor: config.valor,
        data_conquista: new Date().toISOString().slice(0, 10),
      },
      { onConflict: 'user_id,recompensa_config_id,referencia_tipo,referencia_id', ignoreDuplicates: true },
    )
}

/** Semana com 650 XP ou mais e 4 treinos libera a recompensa (resgate manual). */
export async function garantirRecompensaSemanal(
  userId: string,
  semanaInicioIso: string,
  xpSemana: number,
  treinosConcluidos: number,
) {
  const config = await buscarConfig(userId, 'semana_650_xp_4_treinos')
  if (!config) return
  const regra = config.regra as { xp_min?: number; treinos_min?: number }
  const liberada = avaliarRecompensaSemanal(xpSemana, treinosConcluidos, {
    xp_min: regra.xp_min ?? 650,
    treinos_min: regra.treinos_min ?? 4,
  })
  if (liberada) await garantirRecompensa(userId, config, 'semana', semanaInicioIso)
}

/** Sprint com XP acima da meta libera o prêmio do sprint. */
export async function garantirRecompensaSprint(userId: string, sprintId: string, xpSprint: number) {
  const config = await buscarConfig(userId, 'sprint_800_xp')
  if (!config) return
  const regra = config.regra as { xp_min?: number }
  const liberada = avaliarRecompensaPorXpMinimo(xpSprint, { xp_min: regra.xp_min ?? 800 })
  if (liberada) await garantirRecompensa(userId, config, 'sprint', sprintId)
}
