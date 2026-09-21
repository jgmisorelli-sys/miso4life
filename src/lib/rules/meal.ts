export interface ItemRefeicao {
  porcoes: number
  alimento: {
    kcalPorPorcao: number
    proteinaGPorPorcao: number | null
    carboidratoGPorPorcao: number | null
    gorduraGPorPorcao: number | null
    fibraGPorPorcao: number | null
  }
}

export interface TotalRefeicao {
  kcal: number
  proteinaG: number
  carboidratoG: number
  gorduraG: number
  fibraG: number
}

/**
 * Soma calorias/macros de uma refeição a partir dos itens do catálogo e das
 * porções marcadas -- o usuário nunca digita grama nem caloria na hora do
 * registro (seção 9), o cálculo é derivado da configuração do alimento.
 */
export function calcularTotalRefeicao(itens: ItemRefeicao[]): TotalRefeicao {
  return itens.reduce<TotalRefeicao>(
    (total, item) => ({
      kcal: total.kcal + item.porcoes * item.alimento.kcalPorPorcao,
      proteinaG: total.proteinaG + item.porcoes * (item.alimento.proteinaGPorPorcao ?? 0),
      carboidratoG: total.carboidratoG + item.porcoes * (item.alimento.carboidratoGPorPorcao ?? 0),
      gorduraG: total.gorduraG + item.porcoes * (item.alimento.gorduraGPorPorcao ?? 0),
      fibraG: total.fibraG + item.porcoes * (item.alimento.fibraGPorPorcao ?? 0),
    }),
    { kcal: 0, proteinaG: 0, carboidratoG: 0, gorduraG: 0, fibraG: 0 },
  )
}
