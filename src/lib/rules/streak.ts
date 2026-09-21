export interface StreakState {
  sequenciaAtual: number
  recorde: number
  diasSemFalharDuasSeguidas: number
  escudosDisponiveis: number
  /** Primeiro dia (yyyy-mm-dd) do mês em que os escudos atuais foram concedidos. */
  escudosMesReferencia: string
  ultimaDataAvaliada: string | null
  /** Auxiliar: o dia imediatamente anterior ao avaliado agora foi uma falha? */
  diaAnteriorFalhou: boolean
}

function mesDe(data: string): string {
  return data.slice(0, 7)
}

function primeiroDiaDoMes(data: string): string {
  return `${mesDe(data)}-01`
}

/**
 * Avalia um novo dia contra o estado atual da sequência.
 *
 * Regras (seção 7.3 do plano): a sequência conta dias consecutivos com o
 * mínimo do dia cumprido. Um dia isolado perdido consome 1 escudo (se
 * houver) e preserva a sequência. Dois dias perdidos seguidos zeram a
 * sequência, mas nunca o XP acumulado (isso vive em outra tabela,
 * imutável). "Dias sem falhar duas vezes seguidas" só zera nesse caso de
 * dupla falha consecutiva -- uma falha isolada não o afeta.
 */
export function avaliarDia(estado: StreakState, data: string, cumpriuMinimo: boolean): StreakState {
  const renovarEscudos = mesDe(data) !== mesDe(estado.escudosMesReferencia)
  const escudosDisponiveis = renovarEscudos ? 2 : estado.escudosDisponiveis
  const escudosMesReferencia = renovarEscudos ? primeiroDiaDoMes(data) : estado.escudosMesReferencia

  if (cumpriuMinimo) {
    const sequenciaAtual = estado.sequenciaAtual + 1
    return {
      sequenciaAtual,
      recorde: Math.max(estado.recorde, sequenciaAtual),
      diasSemFalharDuasSeguidas: estado.diasSemFalharDuasSeguidas + 1,
      escudosDisponiveis,
      escudosMesReferencia,
      ultimaDataAvaliada: data,
      diaAnteriorFalhou: false,
    }
  }

  const segundaFalhaSeguida = estado.diaAnteriorFalhou

  if (segundaFalhaSeguida) {
    return {
      sequenciaAtual: 0,
      recorde: estado.recorde,
      diasSemFalharDuasSeguidas: 0,
      escudosDisponiveis,
      escudosMesReferencia,
      ultimaDataAvaliada: data,
      diaAnteriorFalhou: true,
    }
  }

  // Falha isolada: um escudo disponível absorve e preserva a sequência.
  if (escudosDisponiveis > 0) {
    return {
      sequenciaAtual: estado.sequenciaAtual,
      recorde: estado.recorde,
      diasSemFalharDuasSeguidas: estado.diasSemFalharDuasSeguidas + 1,
      escudosDisponiveis: escudosDisponiveis - 1,
      escudosMesReferencia,
      ultimaDataAvaliada: data,
      diaAnteriorFalhou: true,
    }
  }

  // Falha isolada sem escudo: a sequência zera, mas o contador de "sem
  // falhar duas seguidas" continua (a falha não foi dupla).
  return {
    sequenciaAtual: 0,
    recorde: estado.recorde,
    diasSemFalharDuasSeguidas: estado.diasSemFalharDuasSeguidas + 1,
    escudosDisponiveis,
    escudosMesReferencia,
    ultimaDataAvaliada: data,
    diaAnteriorFalhou: true,
  }
}

export function estadoInicialStreak(dataReferencia: string): StreakState {
  return {
    sequenciaAtual: 0,
    recorde: 0,
    diasSemFalharDuasSeguidas: 0,
    escudosDisponiveis: 2,
    escudosMesReferencia: primeiroDiaDoMes(dataReferencia),
    ultimaDataAvaliada: null,
    diaAnteriorFalhou: false,
  }
}
