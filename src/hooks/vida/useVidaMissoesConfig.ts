import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type MissaoConfigRow = Database['public']['Tables']['vida_missoes_config']['Row']

export function useVidaMissoesConfig() {
  const { user } = useAuth()
  const [missoes, setMissoes] = useState<MissaoConfigRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setMissoes([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_missoes_config')
      .select('*')
      .eq('user_id', user.id)
      .eq('ativa', true)
      .order('ordem', { ascending: true })
    setMissoes(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const diarias = missoes.filter((m) => m.tipo === 'diaria')
  const semanais = missoes.filter((m) => m.tipo === 'semanal')

  return { missoes, diarias, semanais, loading, refresh }
}
