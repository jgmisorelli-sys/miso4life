import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database, VidaAlimentoCategoria } from '@/types/database'

export type AlimentoRow = Database['public']['Tables']['vida_alimentos_catalogo']['Row']

export interface NovoAlimento {
  nome: string
  categoria: VidaAlimentoCategoria
  porcao_label: string
  kcal_por_porcao: number
  proteina_g_por_porcao?: number
  carboidrato_g_por_porcao?: number
  gordura_g_por_porcao?: number
}

export function useVidaAlimentosCatalogo() {
  const { user } = useAuth()
  const [alimentos, setAlimentos] = useState<AlimentoRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setAlimentos([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_alimentos_catalogo')
      .select('*')
      .eq('user_id', user.id)
      .order('nome', { ascending: true })
    setAlimentos(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const adicionar = useCallback(
    async (alimento: NovoAlimento) => {
      if (!user) return
      const { error } = await supabase.from('vida_alimentos_catalogo').insert({ user_id: user.id, ...alimento })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const alternarAtivo = useCallback(
    async (id: string, ativo: boolean) => {
      if (!user) return
      const { error } = await supabase.from('vida_alimentos_catalogo').update({ ativo }).eq('id', id)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { alimentos, loading, adicionar, alternarAtivo, refresh }
}
