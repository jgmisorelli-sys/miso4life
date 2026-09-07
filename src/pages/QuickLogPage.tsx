import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useDailyLogs } from '@/hooks/useDailyLogs'
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs'
import { useProfile } from '@/hooks/useProfile'
import type { MealType, WorkoutType } from '@/types/database'

const TABS = ['Alimentação', 'Água', 'Café', 'Treino'] as const
type Tab = (typeof TABS)[number]

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Café da manhã' },
  { value: 'lunch', label: 'Almoço' },
  { value: 'snack', label: 'Lanche' },
  { value: 'dinner', label: 'Jantar' },
  { value: 'extra', label: 'Extra' },
]

export function QuickLogPage() {
  const [tab, setTab] = useState<Tab>('Alimentação')

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Registrar</h2>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap rounded-full px-3 py-1.5 text-sm',
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Alimentação' && <FoodForm />}
      {tab === 'Água' && <WaterForm />}
      {tab === 'Café' && <CoffeeForm />}
      {tab === 'Treino' && <WorkoutForm />}
    </div>
  )
}

function FoodForm() {
  const { addFoodLog } = useDailyLogs()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const form = new FormData(e.currentTarget)
    await addFoodLog({
      meal_type: form.get('meal_type') as MealType,
      food_name: String(form.get('food_name')),
      quantity: String(form.get('quantity') || '') || undefined,
      calories: form.get('calories') ? Number(form.get('calories')) : undefined,
      protein_g: form.get('protein_g') ? Number(form.get('protein_g')) : undefined,
      carbs_g: form.get('carbs_g') ? Number(form.get('carbs_g')) : undefined,
      fat_g: form.get('fat_g') ? Number(form.get('fat_g')) : undefined,
    })
    setSaving(false)
    setSaved(true)
    e.currentTarget.reset()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meal_type">Refeição</Label>
            <select
              id="meal_type"
              name="meal_type"
              required
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {MEAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="food_name">Alimento</Label>
            <Input id="food_name" name="food_name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input id="quantity" name="quantity" placeholder="ex: 100g, 1 unidade" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="calories">Calorias</Label>
              <Input id="calories" name="calories" type="number" min="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="protein_g">Proteína (g)</Label>
              <Input id="protein_g" name="protein_g" type="number" min="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="carbs_g">Carbo (g)</Label>
              <Input id="carbs_g" name="carbs_g" type="number" min="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fat_g">Gordura (g)</Label>
              <Input id="fat_g" name="fat_g" type="number" min="0" />
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            Salvar refeição
          </Button>
          {saved && <p className="text-sm text-muted-foreground">Registrado!</p>}
        </form>
      </CardContent>
    </Card>
  )
}

function WaterForm() {
  const { addWaterLog, totalWaterMl } = useDailyLogs()
  const { profile } = useProfile()
  const glassSize = profile?.glass_size_ml ?? 250

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <p className="text-sm text-muted-foreground">Hoje: {totalWaterMl} ml</p>
        <div className="flex gap-3">
          <Button onClick={() => addWaterLog(glassSize)}>+1 copo ({glassSize} ml)</Button>
          <Button variant="outline" onClick={() => addWaterLog(500)}>
            +500 ml
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CoffeeForm() {
  const { addCoffeeLog, totalCoffee } = useDailyLogs()

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <p className="text-sm text-muted-foreground">Hoje: {totalCoffee} xícaras</p>
        <Button onClick={() => addCoffeeLog(1, 'cups')}>+1 xícara de café</Button>
      </CardContent>
    </Card>
  )
}

function WorkoutForm() {
  const { addWorkoutLog } = useWorkoutLogs()
  const [type, setType] = useState<WorkoutType>('strength')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const form = new FormData(e.currentTarget)
    await addWorkoutLog({
      workout_type: type,
      exercise_name: String(form.get('exercise_name')),
      sets: form.get('sets') ? Number(form.get('sets')) : undefined,
      reps: String(form.get('reps') || '') || undefined,
      weight_kg: form.get('weight_kg') ? Number(form.get('weight_kg')) : undefined,
      duration_min: form.get('duration_min') ? Number(form.get('duration_min')) : undefined,
      distance_km: form.get('distance_km') ? Number(form.get('distance_km')) : undefined,
      calories: form.get('calories') ? Number(form.get('calories')) : undefined,
    })
    setSaving(false)
    setSaved(true)
    e.currentTarget.reset()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'strength' ? 'default' : 'outline'}
              onClick={() => setType('strength')}
            >
              Força
            </Button>
            <Button
              type="button"
              variant={type === 'aerobic' ? 'default' : 'outline'}
              onClick={() => setType('aerobic')}
            >
              Aeróbico
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exercise_name">{type === 'strength' ? 'Exercício' : 'Atividade'}</Label>
            <Input id="exercise_name" name="exercise_name" required />
          </div>

          {type === 'strength' ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sets">Séries</Label>
                <Input id="sets" name="sets" type="number" min="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reps">Reps</Label>
                <Input id="reps" name="reps" placeholder="8-10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="weight_kg">Carga (kg)</Label>
                <Input id="weight_kg" name="weight_kg" type="number" min="0" step="0.5" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="duration_min">Duração (min)</Label>
                <Input id="duration_min" name="duration_min" type="number" min="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="distance_km">Distância (km)</Label>
                <Input id="distance_km" name="distance_km" type="number" min="0" step="0.1" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="calories">Calorias</Label>
                <Input id="calories" name="calories" type="number" min="0" />
              </div>
            </div>
          )}

          <Button type="submit" disabled={saving}>
            Salvar treino
          </Button>
          {saved && <p className="text-sm text-muted-foreground">Registrado!</p>}
        </form>
      </CardContent>
    </Card>
  )
}
