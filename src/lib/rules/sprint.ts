import { differenceInCalendarDays } from 'date-fns'

export interface SprintProgress {
  metaXp: number
  xpAcumulado: number
  diasRestantes: number
  metaAtingida: boolean
}

/** Progresso de um sprint de 10 dias em relação à meta de XP configurada. */
export function progressoSprint(
  xpAcumulado: number,
  metaXp: number,
  dataFim: string,
  dataAtual: string,
): SprintProgress {
  const diasRestantes = Math.max(differenceInCalendarDays(new Date(dataFim), new Date(dataAtual)), 0)
  return {
    metaXp,
    xpAcumulado,
    diasRestantes,
    metaAtingida: xpAcumulado >= metaXp,
  }
}
