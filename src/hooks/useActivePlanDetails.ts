import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database, DayOfWeek } from '@/types/database'

type DietPlan = Database['public']['Tables']['diet_plans']['Row']
type DietPlanItem = Database['public']['Tables']['diet_plan_items']['Row']
type WorkoutPlan = Database['public']['Tables']['workout_plans']['Row']
type WorkoutPlanDay = Database['public']['Tables']['workout_plan_days']['Row']
type WorkoutPlanExercise = Database['public']['Tables']['workout_plan_exercises']['Row']

const WEEKDAYS: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export function todayDayOfWeek(): DayOfWeek {
  return WEEKDAYS[new Date().getDay()]
}

export function useActiveDietPlan() {
  const { user } = useAuth()
  const [plan, setPlan] = useState<DietPlan | null>(null)
  const [items, setItems] = useState<DietPlanItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPlan(null)
      setItems([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data: activePlan } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (cancelled) return
      setPlan(activePlan)

      if (activePlan) {
        const { data: planItems } = await supabase
          .from('diet_plan_items')
          .select('*')
          .eq('diet_plan_id', activePlan.id)
          .order('order_index', { ascending: true })
        if (!cancelled) setItems(planItems ?? [])
      } else {
        setItems([])
      }
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const todayItems = items.filter((item) => item.day_of_week === todayDayOfWeek())

  return { plan, items, todayItems, loading }
}

export interface WorkoutPlanDayWithExercises extends WorkoutPlanDay {
  exercises: WorkoutPlanExercise[]
}

export function useActiveWorkoutPlan() {
  const { user } = useAuth()
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [days, setDays] = useState<WorkoutPlanDayWithExercises[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPlan(null)
      setDays([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data: activePlan } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (cancelled) return
      setPlan(activePlan)

      if (activePlan) {
        const { data: planDays } = await supabase
          .from('workout_plan_days')
          .select('*')
          .eq('workout_plan_id', activePlan.id)
          .order('order_index', { ascending: true })

        const dayIds = (planDays ?? []).map((d) => d.id)
        const { data: exercises } =
          dayIds.length > 0
            ? await supabase
                .from('workout_plan_exercises')
                .select('*')
                .in('workout_plan_day_id', dayIds)
                .order('order_index', { ascending: true })
            : { data: [] }

        const daysWithExercises: WorkoutPlanDayWithExercises[] = (planDays ?? []).map((day) => ({
          ...day,
          exercises: (exercises ?? []).filter((ex) => ex.workout_plan_day_id === day.id),
        }))

        if (!cancelled) setDays(daysWithExercises)
      } else {
        setDays([])
      }
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  return { plan, days, loading }
}
