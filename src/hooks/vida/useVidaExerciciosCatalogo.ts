import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database, VidaExercicioCategoria } from '@/types/database'

export type ExercicioRow = Database['public']['Tables']['vida_exercicios_catalogo']['Row']

export interface NovoExercicio {
  nome: string
  categoria: VidaExercicioCategoria
  kcal_por_minuto: number
  duracao_min_estimado?: number
  /** Cache: kcal_por_minuto × duracao_min_estimado, calculado no cadastro. */
  kcal_estimado: number
}

export function useVidaExerciciosCatalogo() {
  const { user } = useAuth()
  const [exercicios, setExercicios] = useState<ExercicioRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setExercicios([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_exercicios_catalogo')
      .select('*')
      .eq('user_id', user.id)
      .order('nome', { ascending: true })
    setExercicios(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const adicionar = useCallback(
    async (exercicio: NovoExercicio) => {
      if (!user) return
      const { error } = await supabase.from('vida_exercicios_catalogo').insert({ user_id: user.id, ...exercicio })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const atualizar = useCallback(
    async (id: string, exercicio: NovoExercicio) => {
      if (!user) return
      const { error } = await supabase.from('vida_exercicios_catalogo').update(exercicio).eq('id', id)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const alternarAtivo = useCallback(
    async (id: string, ativo: boolean) => {
      if (!user) return
      const { error } = await supabase.from('vida_exercicios_catalogo').update({ ativo }).eq('id', id)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { exercicios, loading, adicionar, atualizar, alternarAtivo, refresh }
}
