import { Link } from 'react-router-dom'
import { Coffee, Droplets, Flame, GlassWater } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { QuickAddButton } from '@/components/QuickAddButton'
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
  const { totalCalories, totalWaterMl, totalCoffee, addWaterLog, addCoffeeLog } = useDailyLogs()
  const { logs: workoutLogs } = useWorkoutLogs()
  const { todayItems } = useActiveDietPlan()
  const { days: workoutDays } = useActiveWorkoutPlan()

  const calorieGoal = profile?.daily_calorie_goal ?? 0
  const waterGoal = profile?.daily_water_ml_goal ?? 2500
  const coffeeLimit = profile?.daily_coffee_limit ?? 3
  const glassSize = profile?.glass_size_ml ?? 250

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
        <CardContent className="flex items-center gap-4 pt-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-calories-soft text-calories">
            <Flame className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Calorias</p>
            <p className="text-2xl font-semibold">
              {totalCalories}
              {calorieGoal > 0 && (
                <span className="text-sm font-normal text-muted-foreground"> / {calorieGoal} kcal</span>
              )}
            </p>
            {calorieGoal > 0 && <ProgressBar value={totalCalories} max={calorieGoal} className="mt-2" />}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-water-soft text-water">
                <GlassWater className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Água</p>
                <p className="font-semibold">
                  {totalWaterMl} <span className="text-xs font-normal text-muted-foreground">/ {waterGoal} ml</span>
                </p>
              </div>
            </div>
            <ProgressBar value={totalWaterMl} max={waterGoal} barClassName="bg-water" />
            <div className="flex justify-around">
              <QuickAddButton
                icon={<GlassWater className="h-6 w-6" />}
                label={`Copo (${glassSize}ml)`}
                color="water"
                onAdd={() => addWaterLog(glassSize)}
              />
              <QuickAddButton
                icon={<Droplets className="h-6 w-6" />}
                label="Garrafa (500ml)"
                color="water"
                onAdd={() => addWaterLog(500)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coffee-soft text-coffee">
                <Coffee className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Café</p>
                <p className="font-semibold">
                  {totalCoffee} <span className="text-xs font-normal text-muted-foreground">/ {coffeeLimit}</span>
                </p>
              </div>
            </div>
            <ProgressBar
              value={totalCoffee}
              max={coffeeLimit}
              barClassName={totalCoffee > coffeeLimit ? 'bg-destructive' : 'bg-coffee'}
            />
            <div className="flex justify-center">
              <QuickAddButton
                icon={<Coffee className="h-6 w-6" />}
                label="Xícara"
                color="coffee"
                onAdd={() => addCoffeeLog(1, 'cups')}
              />
            </div>
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
