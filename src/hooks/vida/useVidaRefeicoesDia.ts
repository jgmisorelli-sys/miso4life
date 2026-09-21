import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database, VidaRefeicaoTipo } from '@/types/database'

export type RefeicaoRow = Database['public']['Tables']['vida_refeicoes']['Row']

/** Registro rápido por refeição: só dois checks, proteína e prato ok (seção 9). */
export function useVidaRefeicoesDia(data: string) {
  const { user } = useAuth()
  const [refeicoes, setRefeicoes] = useState<RefeicaoRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setRefeicoes([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data: rows } = await supabase
      .from('vida_refeicoes')
      .select('*')
      .eq('user_id', user.id)
      .eq('data', data)
    setRefeicoes(rows ?? [])
    setLoading(false)
  }, [user, data])

  useEffect(() => {
    refresh()
  }, [refresh])

  const marcar = useCallback(
    async (tipoRefeicao: VidaRefeicaoTipo, campo: 'proteina_ok' | 'prato_ok', valor: boolean) => {
      if (!user) return { error: null }
      const existente = refeicoes.find((r) => r.tipo_refeicao === tipoRefeicao)
      const camposAlterados: Partial<RefeicaoRow> =
        campo === 'proteina_ok' ? { proteina_ok: valor } : { prato_ok: valor }

      if (existente) {
        const { error } = await supabase.from('vida_refeicoes').update(camposAlterados).eq('id', existente.id)
        if (!error) await refresh()
        return { error }
      }
      const { error } = await supabase
        .from('vida_refeicoes')
        .insert({ user_id: user.id, data, tipo_refeicao: tipoRefeicao, ...camposAlterados })
      if (!error) await refresh()
      return { error }
    },
    [user, data, refeicoes, refresh],
  )

  return { refeicoes, loading, marcar, refresh }
}
