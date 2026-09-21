import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type RegistroDiaRow = Database['public']['Tables']['vida_registro_dia']['Row']

export function useVidaRegistroDia(data: string) {
  const { user } = useAuth()
  const [registro, setRegistro] = useState<RegistroDiaRow | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setRegistro(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data: row } = await supabase
      .from('vida_registro_dia')
      .select('*')
      .eq('user_id', user.id)
      .eq('data', data)
      .maybeSingle()
    setRegistro(row)
    setLoading(false)
  }, [user, data])

  useEffect(() => {
    refresh()
  }, [refresh])

  const salvar = useCallback(
    async (updates: Partial<RegistroDiaRow>) => {
      if (!user) return { error: null }
      const { data: row, error } = await supabase
        .from('vida_registro_dia')
        .upsert({ user_id: user.id, data, ...updates }, { onConflict: 'user_id,data' })
        .select('*')
        .single()
      if (!error) setRegistro(row)
      return { error }
    },
    [user, data],
  )

  return { registro, loading, salvar, refresh }
}
