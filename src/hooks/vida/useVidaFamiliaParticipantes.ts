import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type FamiliaParticipanteRow = Database['public']['Tables']['vida_familia_participantes']['Row']

export function useVidaFamiliaParticipantes() {
  const { user } = useAuth()
  const [participantes, setParticipantes] = useState<FamiliaParticipanteRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setParticipantes([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_familia_participantes')
      .select('*')
      .eq('user_id', user.id)
      .order('nome', { ascending: true })
    setParticipantes(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const adicionar = useCallback(
    async (nome: string) => {
      if (!user) return
      const { error } = await supabase.from('vida_familia_participantes').insert({ user_id: user.id, nome })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const alternarAtivo = useCallback(
    async (id: string, ativo: boolean) => {
      if (!user) return
      const { error } = await supabase.from('vida_familia_participantes').update({ ativo }).eq('id', id)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { participantes, loading, adicionar, alternarAtivo, refresh }
}
