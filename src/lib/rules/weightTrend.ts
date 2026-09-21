import { differenceInCalendarDays } from 'date-fns'

/** Média móvel simples, útil para suavizar a oscilação de água do peso bruto (seção 10). */
export function mediaMovel(valores: number[], janela: number): number[] {
  return valores.map((_, indice) => {
    const inicio = Math.max(0, indice - janela + 1)
    const fatia = valores.slice(inicio, indice + 1)
    return fatia.reduce((soma, v) => soma + v, 0) / fatia.length
  })
}

export interface RegistroPeso {
  data: string
  pesoKg: number
}

/**
 * Ritmo médio de perda de peso por semana, entre o primeiro e o último
 * registro fornecidos (normalmente uma janela de 14 dias). Retorna null se
 * não houver dados suficientes para calcular uma tendência.
 */
export function calcularPerdaMediaSemanal(registros: RegistroPeso[]): number | null {
  if (registros.length < 2) return null

  const ordenados = [...registros].sort((a, b) => a.data.localeCompare(b.data))
  const primeiro = ordenados[0]
  const ultimo = ordenados[ordenados.length - 1]
  const dias = differenceInCalendarDays(new Date(ultimo.data), new Date(primeiro.data))
  if (dias <= 0) return null

  const perdaTotalKg = primeiro.pesoKg - ultimo.pesoKg
  return (perdaTotalKg / dias) * 7
}

export type SugestaoAjuste = 'reduzir_calorias_ou_somar_passos' | 'aumentar_calorias' | 'manter'

/**
 * Sugestão de ajuste a cada 14 dias (seção 6.3). Nunca é aplicada
 * automaticamente -- é só um cartão de sugestão para o usuário decidir, e
 * nunca deve usar linguagem de alerta médico.
 */
export function sugerirAjuste14Dias(perdaMediaSemanalKg: number): SugestaoAjuste {
  if (perdaMediaSemanalKg < 0.3) return 'reduzir_calorias_ou_somar_passos'
  if (perdaMediaSemanalKg > 0.9) return 'aumentar_calorias'
  return 'manter'
}
