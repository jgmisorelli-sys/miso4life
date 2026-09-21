import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type TreinoFeitoRow = Database['public']['Tables']['vida_treinos_feitos']['Row']

export function useVidaTreinosFeitos(dataInicio: string, dataFim: string = dataInicio) {
  const { user } = useAuth()
  const [feitos, setFeitos] = useState<TreinoFeitoRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setFeitos([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_treinos_feitos')
      .select('*')
      .eq('user_id', user.id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
    setFeitos(data ?? [])
    setLoading(false)
  }, [user, dataInicio, dataFim])

  useEffect(() => {
    refresh()
  }, [refresh])

  const registrar = useCallback(
    async (data: string, sessaoId: string | null, versaoMinima = false) => {
      if (!user) return { error: null }
      const { error } = await supabase
        .from('vida_treinos_feitos')
        .insert({ user_id: user.id, data, sessao_id: sessaoId, versao_minima: versaoMinima })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { feitos, loading, registrar, refresh }
}
