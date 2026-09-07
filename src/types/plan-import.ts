import type { DayOfWeek, MealType } from '@/types/database'

export interface DietImportItem {
  meal: MealType
  food: string
  quantity?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

export interface DietImport {
  type: 'diet'
  name: string
  description?: string
  days: Record<DayOfWeek, DietImportItem[]>
}

export interface WorkoutImportExercise {
  name: string
  sets?: number
  reps?: string
  notes?: string
}

export interface WorkoutImportDay {
  label: string
  exercises: WorkoutImportExercise[]
}

export interface WorkoutImport {
  type: 'workout'
  name: string
  description?: string
  cycle: WorkoutImportDay[]
}

export type PlanImport = DietImport | WorkoutImport
