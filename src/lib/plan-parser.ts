import type {
  DietImport,
  DietImportItem,
  PlanImport,
  WorkoutImport,
  WorkoutImportDay,
  WorkoutImportExercise,
} from '@/types/plan-import'

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner', 'extra'] as const

export class PlanParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PlanParseError'
  }
}

export type ParseResult =
  | { ok: true; plan: PlanImport }
  | { ok: false; error: string }

/** Parses and validates raw JSON text (pasted or from an uploaded file) against the diet/workout plan schema. */
export function parsePlanJson(raw: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'O texto informado não é um JSON válido.' }
  }

  try {
    const plan = validatePlan(data)
    return { ok: true, plan }
  } catch (err) {
    if (err instanceof PlanParseError) {
      return { ok: false, error: err.message }
    }
    throw err
  }
}

function validatePlan(data: unknown): PlanImport {
  if (typeof data !== 'object' || data === null) {
    throw new PlanParseError('O JSON precisa ser um objeto.')
  }
  const obj = data as Record<string, unknown>

  if (obj.type === 'diet') return validateDiet(obj)
  if (obj.type === 'workout') return validateWorkout(obj)

  throw new PlanParseError(
    'Campo "type" precisa ser "diet" ou "workout".',
  )
}

function requireString(obj: Record<string, unknown>, field: string): string {
  const value = obj[field]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new PlanParseError(`Campo "${field}" é obrigatório e precisa ser um texto.`)
  }
  return value
}

function optionalString(obj: Record<string, unknown>, field: string): string | undefined {
  const value = obj[field]
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') {
    throw new PlanParseError(`Campo "${field}" precisa ser um texto.`)
  }
  return value
}

function optionalNumber(obj: Record<string, unknown>, field: string): number | undefined {
  const value = obj[field]
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new PlanParseError(`Campo "${field}" precisa ser um número.`)
  }
  return value
}

function validateDiet(obj: Record<string, unknown>): DietImport {
  const name = requireString(obj, 'name')
  const description = optionalString(obj, 'description')

  if (typeof obj.days !== 'object' || obj.days === null) {
    throw new PlanParseError('Campo "days" é obrigatório e precisa ser um objeto com os dias da semana.')
  }
  const daysObj = obj.days as Record<string, unknown>

  const days = {} as DietImport['days']
  for (const day of DAYS_OF_WEEK) {
    const rawItems = daysObj[day]
    if (rawItems === undefined) {
      days[day] = []
      continue
    }
    if (!Array.isArray(rawItems)) {
      throw new PlanParseError(`"days.${day}" precisa ser uma lista de refeições.`)
    }
    days[day] = rawItems.map((item, index) => validateDietItem(item, day, index))
  }

  return { type: 'diet', name, description, days }
}

function validateDietItem(item: unknown, day: string, index: number): DietImportItem {
  if (typeof item !== 'object' || item === null) {
    throw new PlanParseError(`"days.${day}[${index}]" precisa ser um objeto.`)
  }
  const obj = item as Record<string, unknown>
  const meal = requireString(obj, 'meal')
  if (!MEAL_TYPES.includes(meal as (typeof MEAL_TYPES)[number])) {
    throw new PlanParseError(
      `"days.${day}[${index}].meal" precisa ser um de: ${MEAL_TYPES.join(', ')}.`,
    )
  }
  const food = requireString(obj, 'food')

  return {
    meal: meal as DietImportItem['meal'],
    food,
    quantity: optionalString(obj, 'quantity'),
    calories: optionalNumber(obj, 'calories'),
    protein: optionalNumber(obj, 'protein'),
    carbs: optionalNumber(obj, 'carbs'),
    fat: optionalNumber(obj, 'fat'),
  }
}

function validateWorkout(obj: Record<string, unknown>): WorkoutImport {
  const name = requireString(obj, 'name')
  const description = optionalString(obj, 'description')

  if (!Array.isArray(obj.cycle) || obj.cycle.length === 0) {
    throw new PlanParseError('Campo "cycle" é obrigatório e precisa ser uma lista com pelo menos um dia de treino.')
  }

  const cycle = obj.cycle.map((day, index) => validateWorkoutDay(day, index))

  return { type: 'workout', name, description, cycle }
}

function validateWorkoutDay(day: unknown, index: number): WorkoutImportDay {
  if (typeof day !== 'object' || day === null) {
    throw new PlanParseError(`"cycle[${index}]" precisa ser um objeto.`)
  }
  const obj = day as Record<string, unknown>
  const label = requireString(obj, 'label')

  if (!Array.isArray(obj.exercises) || obj.exercises.length === 0) {
    throw new PlanParseError(`"cycle[${index}].exercises" precisa ser uma lista com pelo menos um exercício.`)
  }

  const exercises = obj.exercises.map((exercise, exIndex) =>
    validateWorkoutExercise(exercise, index, exIndex),
  )

  return { label, exercises }
}

function validateWorkoutExercise(
  exercise: unknown,
  dayIndex: number,
  exIndex: number,
): WorkoutImportExercise {
  if (typeof exercise !== 'object' || exercise === null) {
    throw new PlanParseError(`"cycle[${dayIndex}].exercises[${exIndex}]" precisa ser um objeto.`)
  }
  const obj = exercise as Record<string, unknown>
  const name = requireString(obj, 'name')

  return {
    name,
    sets: optionalNumber(obj, 'sets'),
    reps: optionalString(obj, 'reps'),
    notes: optionalString(obj, 'notes'),
  }
}
