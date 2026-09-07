import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useProfile } from '@/hooks/useProfile'
import { useDailyLogs } from '@/hooks/useDailyLogs'
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs'
import { useActiveDietPlan, useActiveWorkoutPlan, todayDayOfWeek } from '@/hooks/useActivePlanDetails'

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
  extra: 'Extra',
}

export function DashboardPage() {
  const { profile } = useProfile()
  const { totalCalories, totalWaterMl, totalCoffee } = useDailyLogs()
  const { logs: workoutLogs } = useWorkoutLogs()
  const { todayItems } = useActiveDietPlan()
  const { days: workoutDays } = useActiveWorkoutPlan()

  const calorieGoal = profile?.daily_calorie_goal ?? 0
  const waterGoal = profile?.daily_water_ml_goal ?? 2500
  const coffeeLimit = profile?.daily_coffee_limit ?? 3

  const todayCycleDay = workoutDays[new Date().getDay() % workoutDays.length]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Resumo de hoje</h2>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calorias</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-2xl font-semibold">
            {totalCalories}
            {calorieGoal > 0 && <span className="text-sm font-normal text-muted-foreground"> / {calorieGoal} kcal</span>}
          </p>
          {calorieGoal > 0 && <ProgressBar value={totalCalories} max={calorieGoal} />}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Água</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-xl font-semibold">
              {totalWaterMl} <span className="text-sm font-normal text-muted-foreground">/ {waterGoal} ml</span>
            </p>
            <ProgressBar value={totalWaterMl} max={waterGoal} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Café</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-xl font-semibold">
              {totalCoffee} <span className="text-sm font-normal text-muted-foreground">/ {coffeeLimit}</span>
            </p>
            <ProgressBar
              value={totalCoffee}
              max={coffeeLimit}
              barClassName={totalCoffee > coffeeLimit ? 'bg-destructive' : undefined}
            />
          </CardContent>
        </Card>
      </div>

      {todayItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dieta de hoje ({todayDayOfWeek()})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {todayItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  <span className="text-muted-foreground">{MEAL_LABELS[item.meal_type]}: </span>
                  {item.food_name}
                </span>
                {item.calories && <span className="text-muted-foreground">{item.calories} kcal</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {todayCycleDay && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Treino de hoje — {todayCycleDay.label}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {todayCycleDay.exercises.map((ex) => (
              <div key={ex.id} className="flex justify-between text-sm">
                <span>{ex.name}</span>
                <span className="text-muted-foreground">
                  {ex.sets ? `${ex.sets}x${ex.reps ?? ''}` : ex.reps}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {workoutLogs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum treino registrado hoje ainda.{' '}
          <Link to="/registro" className="text-primary underline">
            Registrar treino
          </Link>
        </p>
      )}
    </div>
  )
}
