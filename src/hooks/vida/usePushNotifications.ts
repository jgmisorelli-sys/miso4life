import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { inscreverPush } from '@/lib/vida/push'

export function usePushNotifications() {
  const { user } = useAuth()
  const [suportado, setSuportado] = useState(false)
  const [inscrito, setInscrito] = useState(false)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const suporta = 'serviceWorker' in navigator && 'PushManager' in window
    setSuportado(suporta)
    if (!suporta) return

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setInscrito(!!subscription))
      .catch(() => setInscrito(false))
  }, [])

  const ativar = useCallback(async () => {
    if (!user) return
    setCarregando(true)
    const subscription = await inscreverPush()
    if (subscription) {
      const json = subscription.toJSON()
      if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
        await supabase.from('vida_push_subscriptions').upsert(
          {
            user_id: user.id,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
          },
          { onConflict: 'user_id,endpoint' },
        )
        setInscrito(true)
      }
    }
    setCarregando(false)
  }, [user])

  const desativar = useCallback(async () => {
    if (!user) return
    setCarregando(true)
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await supabase
        .from('vida_push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint)
      await subscription.unsubscribe()
    }
    setInscrito(false)
    setCarregando(false)
  }, [user])

  return { suportado, inscrito, carregando, ativar, desativar }
}
