import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { startOfToday } from '@/lib/date'
import type { CoffeeUnit, Database, MealType } from '@/types/database'

type FoodLog = Database['public']['Tables']['food_logs']['Row']
type WaterLog = Database['public']['Tables']['water_logs']['Row']
type CoffeeLog = Database['public']['Tables']['coffee_logs']['Row']

export function useDailyLogs() {
  const { user } = useAuth()
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [coffeeLogs, setCoffeeLogs] = useState<CoffeeLog[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setFoodLogs([])
      setWaterLogs([])
      setCoffeeLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    const sinceIso = startOfToday().toISOString()

    const [food, water, coffee] = await Promise.all([
      supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', sinceIso)
        .order('logged_at', { ascending: true }),
      supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', sinceIso)
        .order('logged_at', { ascending: true }),
      supabase
        .from('coffee_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', sinceIso)
        .order('logged_at', { ascending: true }),
    ])

    setFoodLogs(food.data ?? [])
    setWaterLogs(water.data ?? [])
    setCoffeeLogs(coffee.data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addFoodLog = useCallback(
    async (entry: {
      meal_type: MealType
      food_name: string
      quantity?: string
      calories?: number
      protein_g?: number
      carbs_g?: number
      fat_g?: number
      fiber_g?: number
    }) => {
      if (!user) return
      const { error } = await supabase.from('food_logs').insert({ ...entry, user_id: user.id })
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

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

  const removeFoodLog = useCallback(
    async (id: string) => {
      if (!user) return
      const { error } = await supabase.from('food_logs').delete().eq('id', id)
      if (!error) await refresh()
      return { error }
    },
    [user, refresh],
  )

  const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0)
  const totalWaterMl = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0)
  const totalCoffee = coffeeLogs.reduce((sum, log) => sum + log.amount, 0)

  return {
    foodLogs,
    waterLogs,
    coffeeLogs,
    totalCalories,
    totalWaterMl,
    totalCoffee,
    loading,
    addFoodLog,
    addWaterLog,
    addCoffeeLog,
    removeFoodLog,
    refresh,
  }
}
