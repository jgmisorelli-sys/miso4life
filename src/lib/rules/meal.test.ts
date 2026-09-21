import { describe, expect, it } from 'vitest'
import { calcularTotalRefeicao } from './meal'

describe('calcularTotalRefeicao', () => {
  it('soma kcal e macros proporcionalmente às porções', () => {
    const total = calcularTotalRefeicao([
      {
        porcoes: 1.5,
        alimento: { kcalPorPorcao: 100, proteinaGPorPorcao: 20, carboidratoGPorPorcao: 0, gorduraGPorPorcao: 2 },
      },
      {
        porcoes: 1,
        alimento: { kcalPorPorcao: 150, proteinaGPorPorcao: 0, carboidratoGPorPorcao: 30, gorduraGPorPorcao: 0 },
      },
    ])
    expect(total.kcal).toBe(300)
    expect(total.proteinaG).toBe(30)
    expect(total.carboidratoG).toBe(30)
    expect(total.gorduraG).toBe(3)
  })

  it('trata macros nulos como zero', () => {
    const total = calcularTotalRefeicao([
      {
        porcoes: 1,
        alimento: { kcalPorPorcao: 80, proteinaGPorPorcao: null, carboidratoGPorPorcao: null, gorduraGPorPorcao: null },
      },
    ])
    expect(total).toEqual({ kcal: 80, proteinaG: 0, carboidratoG: 0, gorduraG: 0 })
  })

  it('retorna zerado para refeição sem itens', () => {
    expect(calcularTotalRefeicao([])).toEqual({ kcal: 0, proteinaG: 0, carboidratoG: 0, gorduraG: 0 })
  })
})
