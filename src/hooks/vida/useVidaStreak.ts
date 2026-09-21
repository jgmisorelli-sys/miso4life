import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { hojeIso } from '@/lib/vida/date'
import { marcarMinimoDoDiaNaStreak, sincronizarStreakAteHoje, type StreakRow } from '@/lib/vida/streakSync'

export function useVidaStreak() {
  const { user } = useAuth()
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setStreak(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const row = await sincronizarStreakAteHoje(user.id, hojeIso())
    setStreak(row)
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const marcarMinimoCumprido = useCallback(async () => {
    if (!user) return
    const row = await marcarMinimoDoDiaNaStreak(user.id, hojeIso())
    setStreak(row)
  }, [user])

  return { streak, loading, refresh, marcarMinimoCumprido }
}
