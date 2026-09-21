import { describe, expect, it } from 'vitest'
import { avaliarDia, estadoInicialStreak, type StreakState } from './streak'

describe('avaliarDia', () => {
  it('cumprir o mínimo aumenta a sequência e o contador anti-abandono', () => {
    const estado = estadoInicialStreak('2026-01-01')
    const dia1 = avaliarDia(estado, '2026-01-01', true)
    expect(dia1.sequenciaAtual).toBe(1)
    expect(dia1.diasSemFalharDuasSeguidas).toBe(1)
    expect(dia1.diaAnteriorFalhou).toBe(false)

    const dia2 = avaliarDia(dia1, '2026-01-02', true)
    expect(dia2.sequenciaAtual).toBe(2)
    expect(dia2.recorde).toBe(2)
  })

  it('perder um dia isolado com escudo disponível não zera a sequência', () => {
    let estado = estadoInicialStreak('2026-01-01')
    estado = avaliarDia(estado, '2026-01-01', true)
    estado = avaliarDia(estado, '2026-01-02', true)

    const diaPerdido = avaliarDia(estado, '2026-01-03', false)
    expect(diaPerdido.sequenciaAtual).toBe(2)
    expect(diaPerdido.escudosDisponiveis).toBe(1)
    expect(diaPerdido.diaAnteriorFalhou).toBe(true)

    // não zera o contador de "sem falhar duas seguidas" -- foi isolado
    expect(diaPerdido.diasSemFalharDuasSeguidas).toBe(3)
  })

  it('perder dois dias seguidos zera a sequência e o contador anti-abandono', () => {
    let estado = estadoInicialStreak('2026-01-01')
    estado = avaliarDia(estado, '2026-01-01', true)
    estado = avaliarDia(estado, '2026-01-02', true)
    estado = avaliarDia(estado, '2026-01-03', false) // isolado, absorvido por escudo

    const segundaFalha = avaliarDia(estado, '2026-01-04', false)
    expect(segundaFalha.sequenciaAtual).toBe(0)
    expect(segundaFalha.diasSemFalharDuasSeguidas).toBe(0)
  })

  it('sem escudo disponível, falha isolada zera a sequência mas preserva o contador anti-abandono', () => {
    const estadoSemEscudo: StreakState = {
      sequenciaAtual: 5,
      recorde: 5,
      diasSemFalharDuasSeguidas: 10,
      escudosDisponiveis: 0,
      escudosMesReferencia: '2026-01-01',
      ultimaDataAvaliada: '2026-01-10',
      diaAnteriorFalhou: false,
    }
    const resultado = avaliarDia(estadoSemEscudo, '2026-01-11', false)
    expect(resultado.sequenciaAtual).toBe(0)
    expect(resultado.diasSemFalharDuasSeguidas).toBe(11)
  })

  it('renova 2 escudos ao virar o mês', () => {
    const estado: StreakState = {
      sequenciaAtual: 3,
      recorde: 3,
      diasSemFalharDuasSeguidas: 3,
      escudosDisponiveis: 0,
      escudosMesReferencia: '2026-01-01',
      ultimaDataAvaliada: '2026-01-31',
      diaAnteriorFalhou: false,
    }
    const resultado = avaliarDia(estado, '2026-02-01', true)
    expect(resultado.escudosDisponiveis).toBe(2)
    expect(resultado.escudosMesReferencia).toBe('2026-02-01')
  })

  it('o XP acumulado nunca é responsabilidade deste módulo -- não existe campo de XP no estado', () => {
    const estado = estadoInicialStreak('2026-01-01')
    expect('xp' in estado).toBe(false)
  })
})
