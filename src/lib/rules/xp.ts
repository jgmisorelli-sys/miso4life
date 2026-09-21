export interface MissionConfig {
  codigo: string
  tipo: 'diaria' | 'semanal'
  xp: number
  xpSemanaPesada: number | null
  ativa: boolean
}

function resolverXp(missao: MissionConfig, semanaPesada: boolean): number {
  if (semanaPesada && missao.xpSemanaPesada != null) return missao.xpSemanaPesada
  return missao.xp
}

/** Soma o XP das missões diárias marcadas como concluídas no dia. */
export function calcularXpDiario(
  missoesConcluidas: string[],
  missoesConfig: MissionConfig[],
  semanaPesada: boolean,
): number {
  return missoesConfig
    .filter((m) => m.tipo === 'diaria' && m.ativa && missoesConcluidas.includes(m.codigo))
    .reduce((total, m) => total + resolverXp(m, semanaPesada), 0)
}

/** XP máximo possível no dia, dado o conjunto de missões ativas (deve ser 100 no plano padrão). */
export function calcularXpMaximoDiario(missoesConfig: MissionConfig[], semanaPesada: boolean): number {
  return missoesConfig
    .filter((m) => m.tipo === 'diaria' && m.ativa)
    .reduce((total, m) => total + resolverXp(m, semanaPesada), 0)
}

/** Soma o XP das missões semanais marcadas como concluídas na semana. */
export function calcularXpSemanal(missoesConcluidas: string[], missoesConfig: MissionConfig[]): number {
  return missoesConfig
    .filter((m) => m.tipo === 'semanal' && m.ativa && missoesConcluidas.includes(m.codigo))
    .reduce((total, m) => total + m.xp, 0)
}
