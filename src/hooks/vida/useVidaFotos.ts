import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database, VidaFotoAngulo } from '@/types/database'

export type FotoRow = Database['public']['Tables']['vida_fotos']['Row']

const UMA_HORA_EM_SEGUNDOS = 60 * 60

/** Fotos mensais (frente/lado/costas), guardadas no bucket privado vida-fotos. */
export function useVidaFotos() {
  const { user } = useAuth()
  const [fotos, setFotos] = useState<FotoRow[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setFotos([])
      setUrls({})
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('vida_fotos')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: true })
    const lista = data ?? []
    setFotos(lista)

    const entradas = await Promise.all(
      lista.map(async (foto) => {
        const { data: assinada } = await supabase.storage
          .from('vida-fotos')
          .createSignedUrl(foto.caminho_storage, UMA_HORA_EM_SEGUNDOS)
        return [foto.id, assinada?.signedUrl ?? ''] as const
      }),
    )
    setUrls(Object.fromEntries(entradas))
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const enviar = useCallback(
    async (data: string, angulo: VidaFotoAngulo, arquivo: File) => {
      if (!user) return { error: null }
      const extensao = arquivo.name.split('.').pop() ?? 'jpg'
      const caminho = `${user.id}/${data}-${angulo}.${extensao}`

      const upload = await supabase.storage.from('vida-fotos').upload(caminho, arquivo, { upsert: true })
      if (upload.error) return { error: upload.error }

      const { error } = await supabase
        .from('vida_fotos')
        .upsert(
          { user_id: user.id, data, angulo, caminho_storage: caminho },
          { onConflict: 'user_id,data,angulo' },
        )
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { fotos, urls, loading, enviar, refresh }
}
