import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { calcularTotalRefeicao, type ItemRefeicao, type TotalRefeicao } from '@/lib/rules'
import type { Database, VidaRefeicaoTipo } from '@/types/database'

type AlimentoRow = Database['public']['Tables']['vida_alimentos_catalogo']['Row']
type ItemRow = Database['public']['Tables']['vida_refeicoes_itens']['Row']

export interface ItemComAlimento extends ItemRow {
  alimento: AlimentoRow | null
  refeicao: { tipo_refeicao: VidaRefeicaoTipo } | null
}

function converterParaItemRegra(item: ItemComAlimento): ItemRefeicao | null {
  if (!item.alimento) return null
  return {
    porcoes: item.porcoes,
    alimento: {
      kcalPorPorcao: item.alimento.kcal_por_porcao,
      proteinaGPorPorcao: item.alimento.proteina_g_por_porcao,
      carboidratoGPorPorcao: item.alimento.carboidrato_g_por_porcao,
      gorduraGPorPorcao: item.alimento.gordura_g_por_porcao,
      fibraGPorPorcao: item.alimento.fibra_g_por_porcao,
    },
  }
}

/** Itens do catálogo anexados às refeições do dia, com o total de kcal/macros já calculado. */
export function useVidaRefeicaoItensDia(data: string) {
  const { user } = useAuth()
  const [itens, setItens] = useState<ItemComAlimento[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setItens([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data: refeicoes } = await supabase
      .from('vida_refeicoes')
      .select('id')
      .eq('user_id', user.id)
      .eq('data', data)
    const refeicaoIds = (refeicoes ?? []).map((r) => r.id)

    if (refeicaoIds.length === 0) {
      setItens([])
      setLoading(false)
      return
    }

    const { data: rows } = await supabase
      .from('vida_refeicoes_itens')
      .select('*, alimento:vida_alimentos_catalogo(*), refeicao:vida_refeicoes(tipo_refeicao)')
      .in('refeicao_id', refeicaoIds)
    setItens((rows ?? []) as unknown as ItemComAlimento[])
    setLoading(false)
  }, [user, data])

  useEffect(() => {
    refresh()
  }, [refresh])

  const adicionarItem = useCallback(
    async (tipoRefeicao: VidaRefeicaoTipo, alimentoId: string, porcoes: number) => {
      if (!user) return { error: null }
      const { data: refeicao, error: erroRefeicao } = await supabase
        .from('vida_refeicoes')
        .upsert(
          { user_id: user.id, data, tipo_refeicao: tipoRefeicao },
          { onConflict: 'user_id,data,tipo_refeicao' },
        )
        .select('id')
        .single()
      if (erroRefeicao || !refeicao) return { error: erroRefeicao }

      const { error } = await supabase
        .from('vida_refeicoes_itens')
        .insert({ user_id: user.id, refeicao_id: refeicao.id, alimento_id: alimentoId, porcoes })
      if (!error) await refresh()
      return { error }
    },
    [user, data, refresh],
  )

  const removerItem = useCallback(
    async (itemId: string) => {
      if (!user) return
      const { error } = await supabase.from('vida_refeicoes_itens').delete().eq('id', itemId)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const totalDia = useMemo(
    () => calcularTotalRefeicao(itens.map(converterParaItemRegra).filter((i): i is ItemRefeicao => i !== null)),
    [itens],
  )

  const totalPorTipo = useMemo(() => {
    const grupos = new Map<VidaRefeicaoTipo, ItemComAlimento[]>()
    for (const item of itens) {
      const tipo = item.refeicao?.tipo_refeicao
      if (!tipo) continue
      grupos.set(tipo, [...(grupos.get(tipo) ?? []), item])
    }
    const totais = new Map<VidaRefeicaoTipo, TotalRefeicao>()
    for (const [tipo, lista] of grupos) {
      totais.set(tipo, calcularTotalRefeicao(lista.map(converterParaItemRegra).filter((i): i is ItemRefeicao => i !== null)))
    }
    return totais
  }, [itens])

  return { itens, totalDia, totalPorTipo, loading, adicionarItem, removerItem, refresh }
}
