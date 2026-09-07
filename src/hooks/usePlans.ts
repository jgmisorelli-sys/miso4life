import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/types/database'
import type { DietImport, WorkoutImport } from '@/types/plan-import'

type DietPlan = Database['public']['Tables']['diet_plans']['Row']
type WorkoutPlan = Database['public']['Tables']['workout_plans']['Row']

export function useDietPlans() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<DietPlan[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setPlans([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPlans(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const importDiet = useCallback(
    async (plan: DietImport) => {
      if (!user) return { error: new Error('not authenticated') }

      const { data: created, error: planError } = await supabase
        .from('diet_plans')
        .insert({ user_id: user.id, name: plan.name, description: plan.description ?? null })
        .select('*')
        .single()
      if (planError || !created) return { error: planError }

      const items = Object.entries(plan.days).flatMap(([day, mealItems]) =>
        mealItems.map((item, index) => ({
          diet_plan_id: created.id,
          day_of_week: day as Database['public']['Tables']['diet_plan_items']['Row']['day_of_week'],
          meal_type: item.meal,
          food_name: item.food,
          quantity: item.quantity ?? null,
          calories: item.calories ?? null,
          protein_g: item.protein ?? null,
          carbs_g: item.carbs ?? null,
          fat_g: item.fat ?? null,
          order_index: index,
        })),
      )

      if (items.length > 0) {
        const { error: itemsError } = await supabase.from('diet_plan_items').insert(items)
        if (itemsError) return { error: itemsError }
      }

      await refresh()
      return { error: null, planId: created.id }
    },
    [user, refresh],
  )

  const setActiveDietPlan = useCallback(
    async (planId: string) => {
      if (!user) return
      await supabase.from('diet_plans').update({ is_active: false }).eq('user_id', user.id)
      const { error } = await supabase
        .from('diet_plans')
        .update({ is_active: true })
        .eq('id', planId)
      await refresh()
      return { error }
    },
    [user, refresh],
  )

  const deleteDietPlan = useCallback(
    async (planId: string) => {
      const { error } = await supabase.from('diet_plans').delete().eq('id', planId)
      if (!error) await refresh()
      return { error }
    },
    [refresh],
  )

  return { plans, loading, importDiet, setActiveDietPlan, deleteDietPlan, refresh }
}

export function useWorkoutPlans() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setPlans([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPlans(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const importWorkout = useCallback(
    async (plan: WorkoutImport) => {
      if (!user) return { error: new Error('not authenticated') }

      const { data: created, error: planError } = await supabase
        .from('workout_plans')
        .insert({ user_id: user.id, name: plan.name, description: plan.description ?? null })
        .select('*')
        .single()
      if (planError || !created) return { error: planError }

      const dayRows = plan.cycle.map((day, index) => ({
        workout_plan_id: created.id,
        label: day.label,
        order_index: index,
      }))
      const { data: createdDays, error: daysError } = await supabase
        .from('workout_plan_days')
        .insert(dayRows)
        .select('*')
      if (daysError || !createdDays) return { error: daysError }

      const exerciseRows = createdDays.flatMap((dayRow) => {
        const sourceDay = plan.cycle[dayRow.order_index]
        return sourceDay.exercises.map((exercise, index) => ({
          workout_plan_day_id: dayRow.id,
          name: exercise.name,
          sets: exercise.sets ?? null,
          reps: exercise.reps ?? null,
          notes: exercise.notes ?? null,
          order_index: index,
        }))
      })

      if (exerciseRows.length > 0) {
        const { error: exercisesError } = await supabase
          .from('workout_plan_exercises')
          .insert(exerciseRows)
        if (exercisesError) return { error: exercisesError }
      }

      await refresh()
      return { error: null, planId: created.id }
    },
    [user, refresh],
  )

  const setActiveWorkoutPlan = useCallback(
    async (planId: string) => {
      if (!user) return
      await supabase.from('workout_plans').update({ is_active: false }).eq('user_id', user.id)
      const { error } = await supabase
        .from('workout_plans')
        .update({ is_active: true })
        .eq('id', planId)
      await refresh()
      return { error }
    },
    [user, refresh],
  )

  const deleteWorkoutPlan = useCallback(
    async (planId: string) => {
      const { error } = await supabase.from('workout_plans').delete().eq('id', planId)
      if (!error) await refresh()
      return { error }
    },
    [refresh],
  )

  return { plans, loading, importWorkout, setActiveWorkoutPlan, deleteWorkoutPlan, refresh }
}
