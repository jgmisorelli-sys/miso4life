import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type SprintRow = Database['public']['Tables']['vida_sprints']['Row']

export function useVidaSprints() {
  const { user } = useAuth()
  const [sprints, setSprints] = useState<SprintRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setSprints([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_sprints')
      .select('*')
      .eq('user_id', user.id)
      .order('numero', { ascending: true })
    setSprints(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const sprintAtivo = sprints.find((s) => s.status === 'ativa') ?? null

  return { sprints, sprintAtivo, loading, refresh }
}

/** Soma o XP do extrato imutável dentro de um intervalo de datas (usado pelo sprint). */
export async function somarXpNoPeriodo(userId: string, dataInicio: string, dataFim: string): Promise<number> {
  const { data } = await supabase
    .from('vida_xp_ledger')
    .select('xp')
    .eq('user_id', userId)
    .gte('data', dataInicio)
    .lte('data', dataFim)
  return (data ?? []).reduce((total, row) => total + row.xp, 0)
}
