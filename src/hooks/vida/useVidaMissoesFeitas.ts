import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type MissaoFeitaRow = Database['public']['Tables']['vida_missoes_feitas']['Row']

/**
 * Missões marcadas num intervalo de datas (um único dia quando dataFim é
 * omitido, ou a semana inteira). Marcar é definitivo -- não existe
 * "desmarcar" aqui de propósito, pra bater com "nada é tirado dele".
 */
export function useVidaMissoesFeitas(dataInicio: string, dataFim: string = dataInicio) {
  const { user } = useAuth()
  const [feitas, setFeitas] = useState<MissaoFeitaRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setFeitas([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_missoes_feitas')
      .select('*')
      .eq('user_id', user.id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
    setFeitas(data ?? [])
    setLoading(false)
  }, [user, dataInicio, dataFim])

  useEffect(() => {
    refresh()
  }, [refresh])

  const marcar = useCallback(
    async (data: string, missaoCodigo: string, xp: number) => {
      if (!user) return { error: null }
      if (feitas.some((f) => f.data === data && f.missao_codigo === missaoCodigo)) {
        return { error: null }
      }
      const { error } = await supabase
        .from('vida_missoes_feitas')
        .insert({ user_id: user.id, data, missao_codigo: missaoCodigo, xp_concedido: xp })
      if (error) return { error }

      await supabase.from('vida_xp_ledger').insert({
        user_id: user.id,
        data,
        xp,
        motivo: `Missão: ${missaoCodigo}`,
        referencia_tipo: 'missao',
      })
      await refresh()
      return { error: null }
    },
    [user, feitas, refresh],
  )

  const codigosConcluidos = feitas.map((f) => f.missao_codigo)

  return { feitas, codigosConcluidos, loading, marcar, refresh }
}
