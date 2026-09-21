import { describe, expect, it } from 'vitest'
import { progressoSprint } from './sprint'

describe('progressoSprint', () => {
  it('sinaliza meta atingida quando o XP acumulado alcança a meta', () => {
    const resultado = progressoSprint(800, 800, '2026-01-10', '2026-01-05')
    expect(resultado.metaAtingida).toBe(true)
  })

  it('não atinge a meta com XP abaixo do configurado', () => {
    const resultado = progressoSprint(799, 800, '2026-01-10', '2026-01-05')
    expect(resultado.metaAtingida).toBe(false)
  })

  it('calcula dias restantes corretamente', () => {
    const resultado = progressoSprint(0, 800, '2026-01-10', '2026-01-05')
    expect(resultado.diasRestantes).toBe(5)
  })

  it('nunca retorna dias restantes negativos após o fim do sprint', () => {
    const resultado = progressoSprint(0, 800, '2026-01-10', '2026-01-15')
    expect(resultado.diasRestantes).toBe(0)
  })
})
