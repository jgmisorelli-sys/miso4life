import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type FaseRow = Database['public']['Tables']['vida_fases']['Row']

export function useVidaFases() {
  const { user } = useAuth()
  const [fases, setFases] = useState<FaseRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setFases([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_fases')
      .select('*')
      .eq('user_id', user.id)
      .order('numero', { ascending: true })
    setFases(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const faseAtiva = fases.find((f) => f.status === 'ativa') ?? null

  return { fases, faseAtiva, loading, refresh }
}
