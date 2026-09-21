import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { sincronizarConquistas } from '@/lib/vida/achievementsSync'
import type { Database } from '@/types/database'

export type ConquistaRow = Database['public']['Tables']['vida_conquistas']['Row']

export function useVidaConquistas() {
  const { user } = useAuth()
  const [conquistas, setConquistas] = useState<ConquistaRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setConquistas([])
      setLoading(false)
      return
    }
    setLoading(true)
    await sincronizarConquistas(user.id)
    const { data } = await supabase
      .from('vida_conquistas')
      .select('*')
      .eq('user_id', user.id)
      .order('data_conquista', { ascending: false })
    setConquistas(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { conquistas, loading, refresh }
}
