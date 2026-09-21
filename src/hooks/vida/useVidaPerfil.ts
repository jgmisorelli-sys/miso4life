import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'

export type PerfilRow = Database['public']['Tables']['vida_perfil']['Row']

export function useVidaPerfil() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState<PerfilRow | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setPerfil(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase.from('vida_perfil').select('*').eq('user_id', user.id).maybeSingle()
    setPerfil(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const salvar = useCallback(
    async (updates: Partial<PerfilRow>) => {
      if (!user) return { error: null }
      const { data, error } = await supabase
        .from('vida_perfil')
        .update(updates)
        .eq('user_id', user.id)
        .select('*')
        .single()
      if (!error) setPerfil(data)
      return { error }
    },
    [user],
  )

  return { perfil, loading, salvar, refresh }
}
