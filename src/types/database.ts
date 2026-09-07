export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extra'
export type WorkoutType = 'strength' | 'aerobic'
export type CoffeeUnit = 'cups' | 'ml'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          target_weight_kg: number | null
          daily_calorie_goal: number | null
          daily_water_ml_goal: number
          glass_size_ml: number
          daily_coffee_limit: number
          coffee_unit: CoffeeUnit
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      body_logs: {
        Row: {
          id: string
          user_id: string
          weight_kg: number
          body_fat_pct: number | null
          waist_cm: number | null
          hip_cm: number | null
          logged_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['body_logs']['Row']> & {
          user_id: string
          weight_kg: number
        }
        Update: Partial<Database['public']['Tables']['body_logs']['Row']>
        Relationships: []
      }
      food_logs: {
        Row: {
          id: string
          user_id: string
          meal_type: MealType
          food_name: string
          quantity: string | null
          calories: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          logged_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['food_logs']['Row']> & {
          user_id: string
          meal_type: MealType
          food_name: string
        }
        Update: Partial<Database['public']['Tables']['food_logs']['Row']>
        Relationships: []
      }
      water_logs: {
        Row: {
          id: string
          user_id: string
          amount_ml: number
          logged_at: string
        }
        Insert: Partial<Database['public']['Tables']['water_logs']['Row']> & {
          user_id: string
          amount_ml: number
        }
        Update: Partial<Database['public']['Tables']['water_logs']['Row']>
        Relationships: []
      }
      coffee_logs: {
        Row: {
          id: string
          user_id: string
          amount: number
          unit: CoffeeUnit
          logged_at: string
        }
        Insert: Partial<Database['public']['Tables']['coffee_logs']['Row']> & {
          user_id: string
          amount: number
        }
        Update: Partial<Database['public']['Tables']['coffee_logs']['Row']>
        Relationships: []
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          workout_type: WorkoutType
          exercise_name: string
          sets: number | null
          reps: string | null
          weight_kg: number | null
          duration_min: number | null
          distance_km: number | null
          calories: number | null
          logged_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['workout_logs']['Row']> & {
          user_id: string
          workout_type: WorkoutType
          exercise_name: string
        }
        Update: Partial<Database['public']['Tables']['workout_logs']['Row']>
        Relationships: []
      }
      diet_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['diet_plans']['Row']> & {
          user_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['diet_plans']['Row']>
        Relationships: []
      }
      diet_plan_items: {
        Row: {
          id: string
          diet_plan_id: string
          day_of_week: DayOfWeek
          meal_type: MealType
          food_name: string
          quantity: string | null
          calories: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          order_index: number
        }
        Insert: Partial<Database['public']['Tables']['diet_plan_items']['Row']> & {
          diet_plan_id: string
          day_of_week: DayOfWeek
          meal_type: MealType
          food_name: string
        }
        Update: Partial<Database['public']['Tables']['diet_plan_items']['Row']>
        Relationships: []
      }
      workout_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['workout_plans']['Row']> & {
          user_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['workout_plans']['Row']>
        Relationships: []
      }
      workout_plan_days: {
        Row: {
          id: string
          workout_plan_id: string
          label: string
          order_index: number
        }
        Insert: Partial<Database['public']['Tables']['workout_plan_days']['Row']> & {
          workout_plan_id: string
          label: string
        }
        Update: Partial<Database['public']['Tables']['workout_plan_days']['Row']>
        Relationships: []
      }
      workout_plan_exercises: {
        Row: {
          id: string
          workout_plan_day_id: string
          name: string
          sets: number | null
          reps: string | null
          notes: string | null
          order_index: number
        }
        Insert: Partial<Database['public']['Tables']['workout_plan_exercises']['Row']> & {
          workout_plan_day_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['workout_plan_exercises']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
