import { describe, expect, it } from 'vitest'
import { calcularXpDiario, calcularXpMaximoDiario, calcularXpSemanal, type MissionConfig } from './xp'

const MISSOES_DIARIAS: MissionConfig[] = [
  { codigo: 'minimo_dia', tipo: 'diaria', xp: 10, xpSemanaPesada: null, ativa: true },
  { codigo: 'treino_previsto', tipo: 'diaria', xp: 25, xpSemanaPesada: null, ativa: true },
  { codigo: 'meta_passos', tipo: 'diaria', xp: 10, xpSemanaPesada: null, ativa: true },
  { codigo: 'proteina_refeicoes', tipo: 'diaria', xp: 15, xpSemanaPesada: null, ativa: true },
  { codigo: 'regra_prato', tipo: 'diaria', xp: 15, xpSemanaPesada: null, ativa: true },
  { codigo: 'zero_liquido_calorico', tipo: 'diaria', xp: 5, xpSemanaPesada: null, ativa: true },
  { codigo: 'jantar_cedo', tipo: 'diaria', xp: 10, xpSemanaPesada: null, ativa: true },
  { codigo: 'dormir_2330', tipo: 'diaria', xp: 10, xpSemanaPesada: null, ativa: true },
]

const MISSOES_SEMANAIS: MissionConfig[] = [
  { codigo: 'semana_4_treinos', tipo: 'semanal', xp: 60, xpSemanaPesada: null, ativa: true },
  { codigo: 'semana_7_minimos', tipo: 'semanal', xp: 40, xpSemanaPesada: null, ativa: true },
  { codigo: 'semana_media_passos', tipo: 'semanal', xp: 30, xpSemanaPesada: null, ativa: true },
  { codigo: 'semana_evento_social', tipo: 'semanal', xp: 50, xpSemanaPesada: null, ativa: true },
  { codigo: 'semana_bonus_familia', tipo: 'semanal', xp: 20, xpSemanaPesada: null, ativa: true },
  { codigo: 'semana_bioimpedancia', tipo: 'semanal', xp: 50, xpSemanaPesada: null, ativa: true },
]

describe('calcularXpDiario', () => {
  it('marcar todas as missões do dia gera exatamente 100 XP', () => {
    const todasAsMissoes = MISSOES_DIARIAS.map((m) => m.codigo)
    expect(calcularXpDiario(todasAsMissoes, MISSOES_DIARIAS, false)).toBe(100)
  })

  it('soma só as missões marcadas', () => {
    expect(calcularXpDiario(['minimo_dia', 'meta_passos'], MISSOES_DIARIAS, false)).toBe(20)
  })

  it('ignora missões inativas', () => {
    const config: MissionConfig[] = [
      { codigo: 'minimo_dia', tipo: 'diaria', xp: 10, xpSemanaPesada: null, ativa: false },
    ]
    expect(calcularXpDiario(['minimo_dia'], config, false)).toBe(0)
  })

  it('usa xp_semana_pesada quando configurado e o modo está ativo', () => {
    const config: MissionConfig[] = [
      { codigo: 'meta_passos', tipo: 'diaria', xp: 10, xpSemanaPesada: 20, ativa: true },
    ]
    expect(calcularXpDiario(['meta_passos'], config, true)).toBe(20)
    expect(calcularXpDiario(['meta_passos'], config, false)).toBe(10)
  })

  it('alterar o valor de XP na config muda o resultado sem precisar de deploy', () => {
    const configAjustada = MISSOES_DIARIAS.map((m) =>
      m.codigo === 'meta_passos' ? { ...m, xp: 999 } : m,
    )
    expect(calcularXpDiario(['meta_passos'], configAjustada, false)).toBe(999)
  })
})

describe('calcularXpMaximoDiario', () => {
  it('é 100 no plano padrão semeado', () => {
    expect(calcularXpMaximoDiario(MISSOES_DIARIAS, false)).toBe(100)
  })

  it('modo semana pesada mantém o teto de 100 quando não há overrides', () => {
    expect(calcularXpMaximoDiario(MISSOES_DIARIAS, true)).toBe(100)
  })
})

describe('calcularXpSemanal', () => {
  it('soma as missões semanais marcadas', () => {
    expect(calcularXpSemanal(['semana_4_treinos', 'semana_7_minimos'], MISSOES_SEMANAIS)).toBe(100)
  })

  it('todas as missões semanais somam 250', () => {
    const todas = MISSOES_SEMANAIS.map((m) => m.codigo)
    expect(calcularXpSemanal(todas, MISSOES_SEMANAIS)).toBe(250)
  })
})
