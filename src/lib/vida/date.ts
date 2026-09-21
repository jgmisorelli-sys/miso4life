import { addDays, endOfWeek, format, startOfWeek } from 'date-fns'
import type { VidaDiaSemana } from '@/types/database'

const DIAS_SEMANA: VidaDiaSemana[] = [
  'domingo',
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
]

export function hojeIso(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function diaSemanaDe(data: Date | string): VidaDiaSemana {
  const d = typeof data === 'string' ? new Date(`${data}T00:00:00`) : data
  return DIAS_SEMANA[d.getDay()]
}

/** Semana de segunda a domingo, para bater com o plano de treino (seção 8). */
export function semanaAtualIntervalo(referencia = new Date()): { inicio: string; fim: string } {
  const inicio = startOfWeek(referencia, { weekStartsOn: 1 })
  const fim = endOfWeek(referencia, { weekStartsOn: 1 })
  return { inicio: format(inicio, 'yyyy-MM-dd'), fim: format(fim, 'yyyy-MM-dd') }
}

export function diaSeguinteIso(data: string): string {
  return format(addDays(new Date(`${data}T00:00:00`), 1), 'yyyy-MM-dd')
}
