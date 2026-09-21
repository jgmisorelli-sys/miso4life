import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type TreinoPlanoRow = Database['public']['Tables']['vida_treinos_plano']['Row']

export function useVidaTreinosPlano() {
  const { user } = useAuth()
  const [sessoes, setSessoes] = useState<TreinoPlanoRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setSessoes([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_treinos_plano')
      .select('*')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .order('ordem', { ascending: true })
    setSessoes(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { sessoes, loading, refresh }
}
