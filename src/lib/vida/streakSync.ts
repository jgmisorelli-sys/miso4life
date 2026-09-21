import { supabase } from '@/lib/supabase'
import { avaliarDia, estadoInicialStreak, type StreakState } from '@/lib/rules'
import { diaSeguinteIso } from '@/lib/vida/date'
import type { Database } from '@/types/database'

export type StreakRow = Database['public']['Tables']['vida_streak']['Row']

function paraEstado(row: StreakRow): StreakState {
  return {
    sequenciaAtual: row.sequencia_atual,
    recorde: row.recorde,
    diasSemFalharDuasSeguidas: row.dias_sem_falhar_duas_seguidas,
    escudosDisponiveis: row.escudos_disponiveis,
    escudosMesReferencia: row.escudos_mes_referencia,
    ultimaDataAvaliada: row.ultima_data_avaliada,
    diaAnteriorFalhou: row.dia_anterior_falhou,
  }
}

function paraColunas(estado: StreakState) {
  return {
    sequencia_atual: estado.sequenciaAtual,
    recorde: estado.recorde,
    dias_sem_falhar_duas_seguidas: estado.diasSemFalharDuasSeguidas,
    escudos_disponiveis: estado.escudosDisponiveis,
    escudos_mes_referencia: estado.escudosMesReferencia,
    ultima_data_avaliada: estado.ultimaDataAvaliada,
    dia_anterior_falhou: estado.diaAnteriorFalhou,
  }
}

async function carregarOuCriarStreak(userId: string, hoje: string): Promise<StreakRow> {
  const { data } = await supabase.from('vida_streak').select('*').eq('user_id', userId).maybeSingle()
  if (data) return data

  const inicial = estadoInicialStreak(hoje)
  const { data: criado } = await supabase
    .from('vida_streak')
    .insert({ user_id: userId, ...paraColunas(inicial) })
    .select('*')
    .single()
  return criado as StreakRow
}

async function cumpriuMinimoNoDia(userId: string, data: string): Promise<boolean> {
  const { data: rows } = await supabase
    .from('vida_missoes_feitas')
    .select('missao_codigo')
    .eq('user_id', userId)
    .eq('data', data)
    .eq('missao_codigo', 'minimo_dia')
  return (rows?.length ?? 0) > 0
}

/**
 * Preenche automaticamente a sequência para qualquer dia passado que não
 * tenha sido avaliado ainda (ex: o usuário abriu o app depois de alguns
 * dias fora). Nunca avalia o dia de hoje -- isso só acontece quando o
 * mínimo do dia é marcado.
 */
export async function sincronizarStreakAteHoje(userId: string, hoje: string): Promise<StreakRow> {
  const row = await carregarOuCriarStreak(userId, hoje)
  let estado = paraEstado(row)
  let cursor = estado.ultimaDataAvaliada ? diaSeguinteIso(estado.ultimaDataAvaliada) : hoje

  while (cursor < hoje) {
    const cumpriu = await cumpriuMinimoNoDia(userId, cursor)
    estado = avaliarDia(estado, cursor, cumpriu)
    cursor = diaSeguinteIso(cursor)
  }

  if (estado.ultimaDataAvaliada === row.ultima_data_avaliada) return row

  const { data: atualizado } = await supabase
    .from('vida_streak')
    .update(paraColunas(estado))
    .eq('user_id', userId)
    .select('*')
    .single()
  return (atualizado as StreakRow) ?? row
}

/** Registra que o mínimo do dia foi cumprido hoje e avança a sequência. */
export async function marcarMinimoDoDiaNaStreak(userId: string, hoje: string): Promise<StreakRow> {
  const row = await carregarOuCriarStreak(userId, hoje)
  if (row.ultima_data_avaliada === hoje) return row

  const estado = avaliarDia(paraEstado(row), hoje, true)
  const { data: atualizado } = await supabase
    .from('vida_streak')
    .update(paraColunas(estado))
    .eq('user_id', userId)
    .select('*')
    .single()
  return (atualizado as StreakRow) ?? row
}
