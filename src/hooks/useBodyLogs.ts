import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

type BodyLog = Database['public']['Tables']['body_logs']['Row']

export function useBodyLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<BodyLog[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('body_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true })
    setLogs(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addBodyLog = useCallback(
    async (entry: {
      weight_kg: number
      body_fat_pct?: number
      waist_cm?: number
      hip_cm?: number
      logged_at?: string
    }) => {
      if (!user) return
      const { error } = await supabase.from('body_logs').insert({ ...entry, user_id: user.id })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { logs, loading, addBodyLog, refresh }
}
