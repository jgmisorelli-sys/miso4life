function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

/** Pede permissão de notificação e inscreve o navegador no push. Retorna null se não suportado ou negado. */
export async function inscreverPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const chavePublica = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
  if (!chavePublica) return null

  const permissao = await Notification.requestPermission()
  if (permissao !== 'granted') return null

  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(chavePublica) as BufferSource,
  })
}
