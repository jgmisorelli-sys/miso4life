import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { startOfToday } from '@/lib/date'
import type { Database, WorkoutType } from '@/types/database'

type WorkoutLog = Database['public']['Tables']['workout_logs']['Row']

export function useWorkoutLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    const sinceIso = startOfToday().toISOString()
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', sinceIso)
      .order('logged_at', { ascending: true })
    setLogs(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addWorkoutLog = useCallback(
    async (entry: {
      workout_type: WorkoutType
      exercise_name: string
      sets?: number
      reps?: string
      weight_kg?: number
      duration_min?: number
      distance_km?: number
      calories?: number
    }) => {
      if (!user) return
      const { error } = await supabase.from('workout_logs').insert({ ...entry, user_id: user.id })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const removeWorkoutLog = useCallback(
    async (id: string) => {
      if (!user) return
      const { error } = await supabase.from('workout_logs').delete().eq('id', id)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  return { logs, loading, addWorkoutLog, removeWorkoutLog, refresh }
}
