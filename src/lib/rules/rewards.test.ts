import { describe, expect, it } from 'vitest'
import { avaliarRecompensaPorXpMinimo, avaliarRecompensaSemanal } from './rewards'

describe('avaliarRecompensaSemanal', () => {
  const regra = { xp_min: 650, treinos_min: 4 }

  it('libera com 650 XP e 4 treinos', () => {
    expect(avaliarRecompensaSemanal(650, 4, regra)).toBe(true)
  })

  it('não libera com XP insuficiente mesmo com treinos completos', () => {
    expect(avaliarRecompensaSemanal(649, 4, regra)).toBe(false)
  })

  it('não libera com XP suficiente mas treinos insuficientes', () => {
    expect(avaliarRecompensaSemanal(700, 3, regra)).toBe(false)
  })

  it('respeita um limite configurado diferente do padrão', () => {
    expect(avaliarRecompensaSemanal(500, 4, { xp_min: 500, treinos_min: 4 })).toBe(true)
  })
})

describe('avaliarRecompensaPorXpMinimo', () => {
  it('libera o prêmio de sprint com 800 XP ou mais', () => {
    expect(avaliarRecompensaPorXpMinimo(800, { xp_min: 800 })).toBe(true)
    expect(avaliarRecompensaPorXpMinimo(799, { xp_min: 800 })).toBe(false)
  })
})
