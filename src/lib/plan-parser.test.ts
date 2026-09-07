import { describe, expect, it } from 'vitest'
import { parsePlanJson } from './plan-parser'

describe('parsePlanJson', () => {
  it('rejects invalid JSON text', () => {
    const result = parsePlanJson('{ not valid json')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/JSON válido/)
  })

  it('rejects a JSON object without a recognized type', () => {
    const result = parsePlanJson(JSON.stringify({ name: 'x' }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/"diet" ou "workout"/)
  })

  it('parses a valid diet plan', () => {
    const raw = JSON.stringify({
      type: 'diet',
      name: 'Dieta cutting 2000kcal',
      description: 'Foco em déficit calórico moderado',
      days: {
        monday: [
          {
            meal: 'breakfast',
            food: 'Ovos mexidos + aveia',
            quantity: '3 ovos + 40g aveia',
            calories: 350,
            protein: 25,
            carbs: 30,
            fat: 15,
          },
        ],
      },
    })

    const result = parsePlanJson(raw)
    expect(result.ok).toBe(true)
    if (result.ok && result.plan.type === 'diet') {
      expect(result.plan.name).toBe('Dieta cutting 2000kcal')
      expect(result.plan.days.monday).toHaveLength(1)
      expect(result.plan.days.monday[0].food).toBe('Ovos mexidos + aveia')
      expect(result.plan.days.tuesday).toEqual([])
    }
  })

  it('rejects a diet item with an invalid meal type', () => {
    const raw = JSON.stringify({
      type: 'diet',
      name: 'Dieta X',
      days: { monday: [{ meal: 'brunch', food: 'Panqueca' }] },
    })
    const result = parsePlanJson(raw)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/days.monday\[0\].meal/)
  })

  it('rejects a diet plan missing the days field', () => {
    const raw = JSON.stringify({ type: 'diet', name: 'Dieta X' })
    const result = parsePlanJson(raw)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/"days"/)
  })

  it('parses a valid workout plan', () => {
    const raw = JSON.stringify({
      type: 'workout',
      name: 'Treino ABC hipertrofia',
      description: '3x por semana',
      cycle: [
        {
          label: 'Dia A - Pernas',
          exercises: [
            { name: 'Agachamento livre', sets: 4, reps: '8-10', notes: 'Aumentar carga' },
          ],
        },
      ],
    })

    const result = parsePlanJson(raw)
    expect(result.ok).toBe(true)
    if (result.ok && result.plan.type === 'workout') {
      expect(result.plan.cycle).toHaveLength(1)
      expect(result.plan.cycle[0].exercises[0].name).toBe('Agachamento livre')
    }
  })

  it('rejects a workout plan with an empty cycle', () => {
    const raw = JSON.stringify({ type: 'workout', name: 'Treino X', cycle: [] })
    const result = parsePlanJson(raw)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/"cycle"/)
  })

  it('rejects a workout day with no exercises', () => {
    const raw = JSON.stringify({
      type: 'workout',
      name: 'Treino X',
      cycle: [{ label: 'Dia A', exercises: [] }],
    })
    const result = parsePlanJson(raw)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/cycle\[0\].exercises/)
  })
})
