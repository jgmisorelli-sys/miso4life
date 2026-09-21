import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type LembreteConfigRow = Database['public']['Tables']['vida_lembretes_config']['Row']

export function useVidaLembretesConfig() {
  const { user } = useAuth()
  const [lembretes, setLembretes] = useState<LembreteConfigRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setLembretes([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase.from('vida_lembretes_config').select('*').eq('user_id', user.id)
    setLembretes(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const atualizar = useCallback(
    async (id: string, updates: Partial<LembreteConfigRow>) => {
      if (!user) return
      const { error } = await supabase.from('vida_lembretes_config').update(updates).eq('id', id)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { lembretes, loading, atualizar, refresh }
}
