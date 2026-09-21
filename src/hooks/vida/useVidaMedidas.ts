import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database, VidaMedidaTipo } from '@/types/database'

export type MedidaRow = Database['public']['Tables']['vida_medidas']['Row']

/** Medidas de um tipo (peso, cintura, bioimpedância, condicionamento), ou de todos se omitido. */
export function useVidaMedidas(tipo?: VidaMedidaTipo) {
  const { user } = useAuth()
  const [medidas, setMedidas] = useState<MedidaRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setMedidas([])
      setLoading(false)
      return
    }
    setLoading(true)
    let query = supabase
      .from('vida_medidas')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: true })
    if (tipo) query = query.eq('tipo', tipo)
    const { data } = await query
    setMedidas(data ?? [])
    setLoading(false)
  }, [user, tipo])

  useEffect(() => {
    refresh()
  }, [refresh])

  const registrar = useCallback(
    async (
      data: string,
      tipoMedida: VidaMedidaTipo,
      valores: Record<string, number | string | null>,
      observacao?: string,
    ) => {
      if (!user) return { error: null }
      const { error } = await supabase
        .from('vida_medidas')
        .upsert(
          { user_id: user.id, data, tipo: tipoMedida, valores, observacao: observacao ?? null },
          { onConflict: 'user_id,data,tipo' },
        )
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { medidas, loading, registrar, refresh }
}
