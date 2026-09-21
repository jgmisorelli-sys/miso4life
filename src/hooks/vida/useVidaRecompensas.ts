import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { hojeIso } from '@/lib/vida/date'
import type { Database } from '@/types/database'

export type RecompensaRow = Database['public']['Tables']['vida_recompensas']['Row']

export function useVidaRecompensas() {
  const { user } = useAuth()
  const [recompensas, setRecompensas] = useState<RecompensaRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setRecompensas([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_recompensas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setRecompensas(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const resgatar = useCallback(
    async (id: string) => {
      if (!user) return
      const { error } = await supabase
        .from('vida_recompensas')
        .update({ estado: 'resgatada', data_resgate: hojeIso() })
        .eq('id', id)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const disponiveis = recompensas.filter((r) => r.estado === 'disponivel')
  const resgatadas = recompensas.filter((r) => r.estado === 'resgatada')

  return { recompensas, disponiveis, resgatadas, loading, resgatar, refresh }
}
