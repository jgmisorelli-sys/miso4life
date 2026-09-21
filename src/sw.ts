/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ url }) => url.hostname.endsWith('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api-cache',
    networkTimeoutSeconds: 5,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
)

interface LembretePush {
  title: string
  body: string
  url?: string
}

self.addEventListener('push', (event) => {
  let dados: LembretePush = { title: 'MISO4Life', body: '' }
  try {
    if (event.data) dados = { ...dados, ...event.data.json() }
  } catch {
    // payload sem JSON válido -- mantém o texto padrão
  }

  const options: NotificationOptions = {
    body: dados.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: { url: dados.url ?? '/jornada' },
  }

  event.waitUntil(self.registration.showNotification(dados.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? '/jornada'
  event.waitUntil(self.clients.openWindow(url))
})
