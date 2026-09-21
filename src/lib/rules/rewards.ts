export interface RegraRecompensaSemanal {
  xp_min: number
  treinos_min: number
}

/** Semana com 650 XP ou mais e 4 treinos libera a recompensa (seção 7.6). */
export function avaliarRecompensaSemanal(
  xpSemana: number,
  treinosConcluidos: number,
  regra: RegraRecompensaSemanal,
): boolean {
  return xpSemana >= regra.xp_min && treinosConcluidos >= regra.treinos_min
}

export interface RegraRecompensaPorXpMinimo {
  xp_min: number
}

/** Sprint com XP acima do mínimo configurado libera o prêmio de sprint. */
export function avaliarRecompensaPorXpMinimo(xp: number, regra: RegraRecompensaPorXpMinimo): boolean {
  return xp >= regra.xp_min
}
