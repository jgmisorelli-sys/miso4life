import { describe, expect, it } from 'vitest'
import { calcularPerdaMediaSemanal, mediaMovel, sugerirAjuste14Dias } from './weightTrend'

describe('mediaMovel', () => {
  it('suaviza usando uma janela de 3 valores', () => {
    const resultado = mediaMovel([90, 89.5, 89, 88.5], 3)
    expect(resultado[0]).toBe(90)
    expect(resultado[1]).toBeCloseTo(89.75)
    expect(resultado[2]).toBeCloseTo(89.5)
    expect(resultado[3]).toBeCloseTo(89)
  })
})

describe('calcularPerdaMediaSemanal', () => {
  it('calcula o ritmo semanal a partir do primeiro e do último registro', () => {
    const registros = [
      { data: '2026-01-01', pesoKg: 90 },
      { data: '2026-01-15', pesoKg: 89 },
    ]
    // 1kg em 14 dias = 0.5kg/semana
    expect(calcularPerdaMediaSemanal(registros)).toBeCloseTo(0.5)
  })

  it('retorna null com menos de 2 registros', () => {
    expect(calcularPerdaMediaSemanal([{ data: '2026-01-01', pesoKg: 90 }])).toBeNull()
  })

  it('funciona independente da ordem de entrada', () => {
    const registros = [
      { data: '2026-01-15', pesoKg: 89 },
      { data: '2026-01-01', pesoKg: 90 },
    ]
    expect(calcularPerdaMediaSemanal(registros)).toBeCloseTo(0.5)
  })
})

describe('sugerirAjuste14Dias', () => {
  it('sugere reduzir calorias ou somar passos quando o ritmo está abaixo de 0.3kg/semana', () => {
    expect(sugerirAjuste14Dias(0.1)).toBe('reduzir_calorias_ou_somar_passos')
  })

  it('sugere aumentar calorias quando o ritmo está acima de 0.9kg/semana', () => {
    expect(sugerirAjuste14Dias(1.2)).toBe('aumentar_calorias')
  })

  it('sugere manter dentro da faixa esperada', () => {
    expect(sugerirAjuste14Dias(0.5)).toBe('manter')
    expect(sugerirAjuste14Dias(0.3)).toBe('manter')
    expect(sugerirAjuste14Dias(0.9)).toBe('manter')
  })
})
