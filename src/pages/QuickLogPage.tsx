import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { AlimentoAutocomplete } from '@/components/AlimentoAutocomplete'
import { ExercicioAutocomplete } from '@/components/ExercicioAutocomplete'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useDailyLogs } from '@/hooks/useDailyLogs'
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs'
import { useVidaAlimentosCatalogo, type AlimentoRow } from '@/hooks/vida/useVidaAlimentosCatalogo'
import { useVidaExerciciosCatalogo, type ExercicioRow } from '@/hooks/vida/useVidaExerciciosCatalogo'
import type { MealType } from '@/types/database'

const TABS = ['Alimentação', 'Treino'] as const
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

      <p className="text-sm text-muted-foreground">
        Dica: registre água e café rapidamente na tela de Início.
      </p>

      {tab === 'Alimentação' && <FoodForm />}
      {tab === 'Treino' && <WorkoutForm />}
    </div>
  )
}

function FoodForm() {
  const { foodLogs, addFoodLog, removeFoodLog } = useDailyLogs()
  const { alimentos } = useVidaAlimentosCatalogo()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [resetToken, setResetToken] = useState(0)

  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [calories, setCalories] = useState('')
  const [proteinG, setProteinG] = useState('')
  const [carbsG, setCarbsG] = useState('')
  const [fatG, setFatG] = useState('')
  const [fiberG, setFiberG] = useState('')

  function preencherComAlimento(a: AlimentoRow) {
    setQuantity(a.porcao_label)
    setCalories(String(a.kcal_por_porcao))
    setProteinG(a.proteina_g_por_porcao != null ? String(a.proteina_g_por_porcao) : '')
    setCarbsG(a.carboidrato_g_por_porcao != null ? String(a.carboidrato_g_por_porcao) : '')
    setFatG(a.gordura_g_por_porcao != null ? String(a.gordura_g_por_porcao) : '')
    setFiberG(a.fibra_g_por_porcao != null ? String(a.fibra_g_por_porcao) : '')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!foodName) return
    setSaving(true)
    setSaved(false)
    await addFoodLog({
      meal_type: mealType,
      food_name: foodName,
      quantity: quantity || undefined,
      calories: calories ? Number(calories) : undefined,
      protein_g: proteinG ? Number(proteinG) : undefined,
      carbs_g: carbsG ? Number(carbsG) : undefined,
      fat_g: fatG ? Number(fatG) : undefined,
      fiber_g: fiberG ? Number(fiberG) : undefined,
    })
    setSaving(false)
    setSaved(true)
    setFoodName('')
    setQuantity('')
    setCalories('')
    setProteinG('')
    setCarbsG('')
    setFatG('')
    setFiberG('')
    setResetToken((t) => t + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      {foodLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Já registrado hoje</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {foodLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <span>
                  <span className="text-muted-foreground">
                    {MEAL_OPTIONS.find((o) => o.value === log.meal_type)?.label}:{' '}
                  </span>
                  {log.food_name}
                  {log.quantity && <span className="text-muted-foreground"> ({log.quantity})</span>}
                  {log.calories != null && <span className="text-muted-foreground"> — {log.calories} kcal</span>}
                </span>
                <button type="button" onClick={() => removeFoodLog(log.id)} aria-label="Remover registro">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meal_type">Refeição</Label>
            <select
              id="meal_type"
              name="meal_type"
              required
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
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
            <AlimentoAutocomplete
              key={resetToken}
              alimentos={alimentos.filter((a) => a.ativo)}
              placeholder="Digite pra buscar no catálogo, ou digite livre"
              className="h-10 text-sm"
              onTextoChange={setFoodName}
              onSelecionar={preencherComAlimento}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              name="quantity"
              placeholder="ex: 100g, 1 unidade"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="calories">Calorias</Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="protein_g">Proteína (g)</Label>
              <Input
                id="protein_g"
                name="protein_g"
                type="number"
                min="0"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="carbs_g">Carbo (g)</Label>
              <Input
                id="carbs_g"
                name="carbs_g"
                type="number"
                min="0"
                value={carbsG}
                onChange={(e) => setCarbsG(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fat_g">Gordura (g)</Label>
              <Input
                id="fat_g"
                name="fat_g"
                type="number"
                min="0"
                value={fatG}
                onChange={(e) => setFatG(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fiber_g">Fibra (g)</Label>
              <Input
                id="fiber_g"
                name="fiber_g"
                type="number"
                min="0"
                value={fiberG}
                onChange={(e) => setFiberG(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            Salvar refeição
          </Button>
          {saved && <p className="text-sm text-muted-foreground">Registrado!</p>}
        </form>
      </CardContent>
      </Card>
    </div>
  )
}

function WorkoutForm() {
  const { logs: workoutLogs, addWorkoutLog, removeWorkoutLog } = useWorkoutLogs()
  const { exercicios } = useVidaExerciciosCatalogo()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [resetToken, setResetToken] = useState(0)

  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [calories, setCalories] = useState('')

  function preencherComExercicio(ex: ExercicioRow) {
    if (ex.duracao_min_estimado != null) {
      setDurationMin(String(ex.duracao_min_estimado))
      if (ex.kcal_por_minuto != null) {
        setCalories(String(Math.round(ex.kcal_por_minuto * ex.duracao_min_estimado)))
      }
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!exerciseName) return
    setSaving(true)
    setSaved(false)
    // Sem distinção de tipo na tela -- guarda como "aerobic" quando é
    // sobretudo cardio (tem duração/distância) e "strength" quando é
    // sobretudo carga (tem séries/carga), só pra manter o dado coerente
    // no banco. A tela não pede essa escolha ao usuário.
    const workoutType = weightKg || sets ? 'strength' : 'aerobic'
    await addWorkoutLog({
      workout_type: workoutType,
      exercise_name: exerciseName,
      sets: sets ? Number(sets) : undefined,
      reps: reps || undefined,
      weight_kg: weightKg ? Number(weightKg) : undefined,
      duration_min: durationMin ? Number(durationMin) : undefined,
      distance_km: distanceKm ? Number(distanceKm) : undefined,
      calories: calories ? Number(calories) : undefined,
    })
    setSaving(false)
    setSaved(true)
    setExerciseName('')
    setSets('')
    setReps('')
    setWeightKg('')
    setDurationMin('')
    setDistanceKm('')
    setCalories('')
    setResetToken((t) => t + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      {workoutLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Já registrado hoje</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {workoutLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <span>
                  {log.exercise_name}
                  {log.duration_min != null && <span className="text-muted-foreground"> — {log.duration_min} min</span>}
                  {log.calories != null && <span className="text-muted-foreground"> · {log.calories} kcal</span>}
                </span>
                <button type="button" onClick={() => removeWorkoutLog(log.id)} aria-label="Remover registro">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exercise_name">Exercício</Label>
            <ExercicioAutocomplete
              key={resetToken}
              exercicios={exercicios.filter((e) => e.ativo)}
              placeholder="Digite pra buscar no catálogo, ou digite livre"
              className="h-10 text-sm"
              onTextoChange={setExerciseName}
              onSelecionar={preencherComExercicio}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="duration_min">Duração (min)</Label>
              <Input
                id="duration_min"
                type="number"
                min="0"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="calories">Calorias</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="distance_km">Distância (km)</Label>
              <Input
                id="distance_km"
                type="number"
                min="0"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weight_kg">Carga (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                min="0"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sets">Séries</Label>
              <Input id="sets" type="number" min="0" value={sets} onChange={(e) => setSets(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reps">Reps</Label>
              <Input id="reps" placeholder="8-10" value={reps} onChange={(e) => setReps(e.target.value)} />
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            Salvar treino
          </Button>
          {saved && <p className="text-sm text-muted-foreground">Registrado!</p>}
        </form>
      </CardContent>
      </Card>
    </div>
  )
}
