import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addDays, format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  GlassWater,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProgressBar } from '@/components/ui/progress-bar'
import { diaSemanaDe, hojeIso } from '@/lib/vida/date'
import { useProfile } from '@/hooks/useProfile'
import { useLogsDoDia } from '@/hooks/useLogsDoDia'
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs'
import { useVidaPerfil } from '@/hooks/vida/useVidaPerfil'
import { useVidaRefeicaoItensDia } from '@/hooks/vida/useVidaRefeicaoItensDia'
import { useVidaRegistroDia } from '@/hooks/vida/useVidaRegistroDia'
import { useVidaTreinosFeitos } from '@/hooks/vida/useVidaTreinosFeitos'
import { useVidaTreinosPlano } from '@/hooks/vida/useVidaTreinosPlano'
import { useActiveDietPlan, useActiveWorkoutPlan, todayDayOfWeek } from '@/hooks/useActivePlanDetails'

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
  extra: 'Extra',
}

const CORES = {
  calories: { icon: 'text-calories', bg: 'bg-calories-soft', bar: 'bg-calories' },
  protein: { icon: 'text-protein', bg: 'bg-protein-soft', bar: 'bg-protein' },
  fat: { icon: 'text-fat', bg: 'bg-fat-soft', bar: 'bg-fat' },
  carbs: { icon: 'text-carbs', bg: 'bg-carbs-soft', bar: 'bg-carbs' },
  fiber: { icon: 'text-fiber', bg: 'bg-fiber-soft', bar: 'bg-fiber' },
  water: { icon: 'text-water', bg: 'bg-water-soft', bar: 'bg-water' },
  coffee: { icon: 'text-coffee', bg: 'bg-coffee-soft', bar: 'bg-coffee' },
  workout: { icon: 'text-workout', bg: 'bg-workout-soft', bar: 'bg-workout' },
  sleep: { icon: 'text-sleep', bg: 'bg-sleep-soft', bar: 'bg-sleep' },
} as const

type Cor = keyof typeof CORES

function LinhaNutriente({
  label,
  valor,
  meta,
  unidade,
  cor,
}: {
  label: string
  valor: number
  meta: number
  unidade: string
  cor: Cor
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {Math.round(valor)}
          {unidade} <span className="text-xs font-normal text-muted-foreground">/ {meta}{unidade}</span>
        </span>
      </div>
      <ProgressBar value={valor} max={meta || 1} barClassName={CORES[cor].bar} />
    </div>
  )
}

function ParPlanejadoRealizado({
  label,
  planejado,
  realizado,
  unidade,
  cor,
}: {
  label: string
  planejado: number
  realizado: number
  unidade: string
  cor: Cor
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {Math.round(realizado)}{unidade}{' '}
          <span className="text-xs font-normal text-muted-foreground">/ {planejado}{unidade} planejado</span>
        </span>
      </div>
      <ProgressBar value={realizado} max={planejado || 1} barClassName={CORES[cor].bar} />
    </div>
  )
}

export function DashboardPage() {
  const [data, setData] = useState(hojeIso())
  const ehHoje = data === hojeIso()
  const diaSemana = diaSemanaDe(data)

  const { profile } = useProfile()
  const { perfil } = useVidaPerfil()
  const {
    totalCaloriesLegado,
    totalProteinaLegado,
    totalCarboidratoLegado,
    totalGorduraLegado,
    totalWaterMl,
    totalCoffee,
    totalKcalTreinoLegado,
    addWaterLog,
    addCoffeeLog,
  } = useLogsDoDia(data)
  const { totalDia: totalJornada } = useVidaRefeicaoItensDia(data)
  const { registro, salvar: salvarRegistro } = useVidaRegistroDia(data)
  const { sessoes } = useVidaTreinosPlano()
  const { kcalTotal: kcalTreinoJornada } = useVidaTreinosFeitos(data)
  const { logs: workoutLogs } = useWorkoutLogs()
  const { todayItems } = useActiveDietPlan()
  const { days: workoutDays } = useActiveWorkoutPlan()

  const [sonoInput, setSonoInput] = useState('')

  // Soma as duas fontes de registro de alimentação: a tela Registrar
  // antiga (food_logs) e o catálogo da Jornada (vida_refeicoes_itens).
  const caloriasIngeridas = totalCaloriesLegado + totalJornada.kcal
  const proteinaIngerida = totalProteinaLegado + totalJornada.proteinaG
  const gorduraIngerida = totalGorduraLegado + totalJornada.gorduraG
  const carboidratoIngerido = totalCarboidratoLegado + totalJornada.carboidratoG
  const fibraIngerida = totalJornada.fibraG

  // Soma as duas fontes de registro de treino: a tela Registrar antiga
  // (workout_logs) e o catálogo de exercícios da Jornada.
  const kcalExercicioRealizado = totalKcalTreinoLegado + kcalTreinoJornada

  const metaCalorias = perfil?.meta_calorias_kcal ?? profile?.daily_calorie_goal ?? 1950
  const metaProteina = perfil?.meta_proteina_g ?? 150
  const metaGordura = perfil?.meta_gordura_g ?? 62
  const metaCarboidrato = perfil?.meta_carboidrato_g ?? 190
  const metaFibra = perfil?.meta_fibra_g ?? 30
  const metaPassos = perfil?.meta_passos ?? 8000
  const metaSono = perfil?.meta_sono_horas ?? 7

  const waterGoal = profile?.daily_water_ml_goal ?? 2500
  const coffeeLimit = profile?.daily_coffee_limit ?? 3
  const glassSize = profile?.glass_size_ml ?? 250

  const sessaoDoDia = sessoes.find((s) => s.dia_semana === diaSemana)
  const metaKcalExercicio = sessaoDoDia?.kcal_estimado ?? 0
  const passosRealizados = registro?.passos ?? 0
  const sonoRealizado = registro?.sono_horas ?? 0

  const todayCycleDay = workoutDays[new Date().getDay() % workoutDays.length]

  function diaAnterior() {
    setData(format(subDays(new Date(`${data}T12:00:00`), 1), 'yyyy-MM-dd'))
  }

  function diaSeguinte() {
    setData(format(addDays(new Date(`${data}T12:00:00`), 1), 'yyyy-MM-dd'))
  }

  async function salvarSono() {
    const valor = Number(sonoInput)
    if (!valor) return
    await salvarRegistro({ sono_horas: valor })
    setSonoInput('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={diaAnterior} aria-label="Dia anterior">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{ehHoje ? 'Resumo de hoje' : 'Resumo do dia'}</h2>
          <p className="text-sm capitalize text-muted-foreground">
            {format(new Date(`${data}T12:00:00`), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={diaSeguinte} disabled={ehHoje} aria-label="Próximo dia">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-4 w-4 text-calories" /> Alimentação
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <LinhaNutriente label="Calorias" valor={caloriasIngeridas} meta={metaCalorias} unidade=" kcal" cor="calories" />
          <LinhaNutriente label="Proteína" valor={proteinaIngerida} meta={metaProteina} unidade="g" cor="protein" />
          <LinhaNutriente label="Gordura" valor={gorduraIngerida} meta={metaGordura} unidade="g" cor="fat" />
          <LinhaNutriente label="Carboidrato" valor={carboidratoIngerido} meta={metaCarboidrato} unidade="g" cor="carbs" />
          <LinhaNutriente label="Fibras" valor={fibraIngerida} meta={metaFibra} unidade="g" cor="fiber" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${CORES.water.bg} ${CORES.water.icon}`}>
                <GlassWater className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Água</p>
                <p className="font-semibold">
                  {totalWaterMl} <span className="text-xs font-normal text-muted-foreground">/ {waterGoal} ml</span>
                </p>
              </div>
            </div>
            <ProgressBar value={totalWaterMl} max={waterGoal} barClassName={CORES.water.bar} />
            {ehHoje ? (
              <div className="flex justify-around">
                <button type="button" onClick={() => addWaterLog(glassSize)} className="flex flex-col items-center gap-1.5">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-full ${CORES.water.bg} ${CORES.water.icon}`}>
                    <GlassWater className="h-6 w-6" />
                  </span>
                  <span className="text-xs text-muted-foreground">Copo ({glassSize}ml)</span>
                </button>
                <button type="button" onClick={() => addWaterLog(500)} className="flex flex-col items-center gap-1.5">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-full ${CORES.water.bg} ${CORES.water.icon}`}>
                    <Droplets className="h-6 w-6" />
                  </span>
                  <span className="text-xs text-muted-foreground">Garrafa (500ml)</span>
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground">Só registra água no dia de hoje</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${CORES.coffee.bg} ${CORES.coffee.icon}`}>
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
              barClassName={totalCoffee > coffeeLimit ? 'bg-destructive' : CORES.coffee.bar}
            />
            {ehHoje ? (
              <div className="flex justify-center">
                <button type="button" onClick={() => addCoffeeLog(1, 'cups')} className="flex flex-col items-center gap-1.5">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-full ${CORES.coffee.bg} ${CORES.coffee.icon}`}>
                    <Coffee className="h-6 w-6" />
                  </span>
                  <span className="text-xs text-muted-foreground">Xícara</span>
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground">Só registra café no dia de hoje</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-4 w-4 text-workout" /> Exercício
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ParPlanejadoRealizado
            label="Calorias"
            planejado={metaKcalExercicio}
            realizado={kcalExercicioRealizado}
            unidade=" kcal"
            cor="workout"
          />
          <ParPlanejadoRealizado label="Passos" planejado={metaPassos} realizado={passosRealizados} unidade="" cor="workout" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="h-4 w-4 text-sleep" /> Sono
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ParPlanejadoRealizado label="Horas dormidas" planejado={metaSono} realizado={sonoRealizado} unidade="h" cor="sleep" />
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.5"
              placeholder={registro?.sono_horas != null ? String(registro.sono_horas) : 'Horas dormidas'}
              value={sonoInput}
              onChange={(e) => setSonoInput(e.target.value)}
            />
            <Button onClick={salvarSono}>Salvar</Button>
          </div>
        </CardContent>
      </Card>

      {ehHoje && todayItems.length > 0 && (
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

      {ehHoje && todayCycleDay && (
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

      {ehHoje && workoutLogs.length === 0 && (
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <Footprints className="h-4 w-4" /> Nenhum treino registrado hoje ainda.{' '}
          <Link to="/registro" className="text-primary underline">
            Registrar treino
          </Link>
        </p>
      )}
    </div>
  )
}
