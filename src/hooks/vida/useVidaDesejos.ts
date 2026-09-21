import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type DesejoRow = Database['public']['Tables']['vida_desejos']['Row']

export function useVidaDesejos() {
  const { user } = useAuth()
  const [desejos, setDesejos] = useState<DesejoRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setDesejos([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_desejos')
      .select('*')
      .eq('user_id', user.id)
      .order('prioridade', { ascending: false })
    setDesejos(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const adicionar = useCallback(
    async (nome: string, valorEstimado?: number, link?: string) => {
      if (!user) return
      const { error } = await supabase
        .from('vida_desejos')
        .insert({ user_id: user.id, nome, valor_estimado: valorEstimado ?? null, link: link ?? null })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const remover = useCallback(
    async (id: string) => {
      if (!user) return
      const { error } = await supabase.from('vida_desejos').delete().eq('id', id)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { desejos, loading, adicionar, remover, refresh }
}
