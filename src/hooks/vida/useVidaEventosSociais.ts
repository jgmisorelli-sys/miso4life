import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { hojeIso } from '@/lib/vida/date'
import type { Database } from '@/types/database'

export type EventoSocialRow = Database['public']['Tables']['vida_eventos_sociais']['Row']

const XP_EVENTO_SOCIAL = 50

export function useVidaEventosSociais() {
  const { user } = useAuth()
  const [eventos, setEventos] = useState<EventoSocialRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setEventos([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_eventos_sociais')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false })
    setEventos(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const registrarEvento = useCallback(
    async (descricao: string) => {
      if (!user) return
      const { error } = await supabase
        .from('vida_eventos_sociais')
        .insert({ user_id: user.id, data: hojeIso(), descricao })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  /** Confirma se o protocolo do evento foi cumprido, liberando os 50 XP da missão semanal. */
  const confirmarProtocolo = useCallback(
    async (eventoId: string, cumprido: boolean) => {
      if (!user) return
      const xp = cumprido ? XP_EVENTO_SOCIAL : 0
      const { error } = await supabase
        .from('vida_eventos_sociais')
        .update({ cumprido, xp_concedido: xp })
        .eq('id', eventoId)
      if (error) return { error }

      if (cumprido) {
        const hoje = hojeIso()
        const jaMarcada = await supabase
          .from('vida_missoes_feitas')
          .select('id')
          .eq('user_id', user.id)
          .eq('data', hoje)
          .eq('missao_codigo', 'semana_evento_social')
          .maybeSingle()
        if (!jaMarcada.data) {
          await supabase.from('vida_missoes_feitas').insert({
            user_id: user.id,
            data: hoje,
            missao_codigo: 'semana_evento_social',
            xp_concedido: XP_EVENTO_SOCIAL,
          })
          await supabase.from('vida_xp_ledger').insert({
            user_id: user.id,
            data: hoje,
            xp: XP_EVENTO_SOCIAL,
            motivo: 'Evento social: protocolo cumprido',
            referencia_tipo: 'evento_social',
            referencia_id: eventoId,
          })
        }
      }
      await refresh()
      return { error: null }
    },
    [user, refresh],
  )

  const pendentesDeConfirmacao = eventos.filter((e) => e.cumprido === null)

  return { eventos, pendentesDeConfirmacao, loading, registrarEvento, confirmarProtocolo, refresh }
}
