import { useCallback, useEffect, useState } from 'react'
import { endOfDay, startOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { CoffeeUnit, Database } from '@/types/database'

type FoodLog = Database['public']['Tables']['food_logs']['Row']
type WaterLog = Database['public']['Tables']['water_logs']['Row']
type CoffeeLog = Database['public']['Tables']['coffee_logs']['Row']
type WorkoutLog = Database['public']['Tables']['workout_logs']['Row']

/** Água, café, alimentação e treino (tela Registrar antiga) de um dia específico -- usado pelo Dashboard com navegação entre dias. */
export function useLogsDoDia(data: string) {
  const { user } = useAuth()
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [coffeeLogs, setCoffeeLogs] = useState<CoffeeLog[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setFoodLogs([])
      setWaterLogs([])
      setCoffeeLogs([])
      setWorkoutLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    const referencia = new Date(`${data}T12:00:00`)
    const desdeIso = startOfDay(referencia).toISOString()
    const ateIso = endOfDay(referencia).toISOString()

    const [food, water, coffee, workout] = await Promise.all([
      supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', desdeIso)
        .lte('logged_at', ateIso),
      supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', desdeIso)
        .lte('logged_at', ateIso),
      supabase
        .from('coffee_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', desdeIso)
        .lte('logged_at', ateIso),
      supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', desdeIso)
        .lte('logged_at', ateIso),
    ])

    setFoodLogs(food.data ?? [])
    setWaterLogs(water.data ?? [])
    setCoffeeLogs(coffee.data ?? [])
    setWorkoutLogs(workout.data ?? [])
    setLoading(false)
  }, [user, data])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addWaterLog = useCallback(
    async (amount_ml: number) => {
      if (!user) return
      const { error } = await supabase.from('water_logs').insert({ amount_ml, user_id: user.id })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const addCoffeeLog = useCallback(
    async (amount: number, unit: CoffeeUnit = 'cups') => {
      if (!user) return
      const { error } = await supabase.from('coffee_logs').insert({ amount, unit, user_id: user.id })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const totalCaloriesLegado = foodLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0)
  const totalProteinaLegado = foodLogs.reduce((sum, log) => sum + (log.protein_g ?? 0), 0)
  const totalCarboidratoLegado = foodLogs.reduce((sum, log) => sum + (log.carbs_g ?? 0), 0)
  const totalGorduraLegado = foodLogs.reduce((sum, log) => sum + (log.fat_g ?? 0), 0)
  const totalWaterMl = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0)
  const totalCoffee = coffeeLogs.reduce((sum, log) => sum + log.amount, 0)
  const totalKcalTreinoLegado = workoutLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0)

  return {
    foodLogs,
    workoutLogs,
    totalCaloriesLegado,
    totalProteinaLegado,
    totalCarboidratoLegado,
    totalGorduraLegado,
    totalWaterMl,
    totalCoffee,
    totalKcalTreinoLegado,
    loading,
    addWaterLog,
    addCoffeeLog,
    refresh,
  }
}
