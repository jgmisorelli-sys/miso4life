import { useMemo, useState } from 'react'
import { Check, Dumbbell, Footprints, Shield, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn } from '@/lib/utils'
import { calcularXpDiario, calcularXpMaximoDiario, type MissionConfig } from '@/lib/rules'
import { diaSemanaDe, hojeIso } from '@/lib/vida/date'
import { useVidaMissoesConfig } from '@/hooks/vida/useVidaMissoesConfig'
import { useVidaMissoesFeitas } from '@/hooks/vida/useVidaMissoesFeitas'
import { useVidaRefeicoesDia } from '@/hooks/vida/useVidaRefeicoesDia'
import { useVidaRegistroDia } from '@/hooks/vida/useVidaRegistroDia'
import { useVidaStreak } from '@/hooks/vida/useVidaStreak'
import { useVidaTreinosFeitos } from '@/hooks/vida/useVidaTreinosFeitos'
import { useVidaTreinosPlano } from '@/hooks/vida/useVidaTreinosPlano'
import type { VidaRefeicaoTipo } from '@/types/database'

// TODO(Fase 6/7 - Configurações): a meta de passos deve seguir a progressão
// semanal de 6.500 a 9.500 (seção 6.1). Por enquanto, um valor fixo.
const META_PASSOS_PADRAO = 8000
const META_PASSOS_SEMANA_PESADA = 7000

const REFEICOES: { tipo: VidaRefeicaoTipo; label: string }[] = [
  { tipo: 'cafe', label: 'Café' },
  { tipo: 'almoco', label: 'Almoço' },
  { tipo: 'lanche', label: 'Lanche' },
  { tipo: 'jantar', label: 'Jantar' },
]

export function HojePage() {
  const hoje = hojeIso()
  const diaSemana = diaSemanaDe(hoje)

  const { diarias, loading: loadingMissoes } = useVidaMissoesConfig()
  const { codigosConcluidos, marcar: marcarMissao } = useVidaMissoesFeitas(hoje)
  const { streak, marcarMinimoCumprido } = useVidaStreak()
  const { registro, salvar: salvarRegistro } = useVidaRegistroDia(hoje)
  const { sessoes } = useVidaTreinosPlano()
  const { feitos: treinosFeitos, registrar: registrarTreino } = useVidaTreinosFeitos(hoje)
  const { refeicoes, marcar: marcarRefeicao } = useVidaRefeicoesDia(hoje)

  const [passosInput, setPassosInput] = useState('')

  const semanaPesada = registro?.semana_pesada ?? false
  const sessaoDeHoje = sessoes.find((s) => s.dia_semana === diaSemana)
  const treinoJaFeito = treinosFeitos.length > 0
  const minimoJaCumprido = codigosConcluidos.includes('minimo_dia')
  const ontemFalhou = streak?.dia_anterior_falhou ?? false

  const missoesConfig: MissionConfig[] = useMemo(
    () =>
      diarias.map((m) => ({
        codigo: m.codigo,
        tipo: m.tipo,
        xp: m.xp,
        xpSemanaPesada: m.xp_semana_pesada,
        ativa: m.ativa,
      })),
    [diarias],
  )

  const xpHoje = calcularXpDiario(codigosConcluidos, missoesConfig, semanaPesada)
  const xpMaximoHoje = calcularXpMaximoDiario(missoesConfig, semanaPesada)

  async function marcar(codigo: string) {
    const missao = diarias.find((m) => m.codigo === codigo)
    if (!missao) return
    const xp = semanaPesada && missao.xp_semana_pesada != null ? missao.xp_semana_pesada : missao.xp
    await marcarMissao(hoje, codigo, xp)
    if (codigo === 'minimo_dia') await marcarMinimoCumprido()
  }

  async function marcarSoMinimo() {
    if (!minimoJaCumprido) await marcar('minimo_dia')
  }

  async function alternarSemanaPesada() {
    await salvarRegistro({ semana_pesada: !semanaPesada })
  }

  async function salvarPassos() {
    const valor = Number(passosInput)
    if (!valor) return
    await salvarRegistro({ passos: valor })
    const meta = semanaPesada ? META_PASSOS_SEMANA_PESADA : META_PASSOS_PADRAO
    if (valor >= meta && !codigosConcluidos.includes('meta_passos')) {
      await marcar('meta_passos')
    }
  }

  async function marcarTreinoFeito() {
    if (treinoJaFeito) return
    await registrarTreino(hoje, sessaoDeHoje?.id ?? null, semanaPesada)
    if (!codigosConcluidos.includes('treino_previsto')) await marcar('treino_previsto')
  }

  async function alternarRefeicao(tipo: VidaRefeicaoTipo, campo: 'proteina_ok' | 'prato_ok', valor: boolean) {
    await marcarRefeicao(tipo, campo, valor)

    const atualizadas = refeicoes.map((r) =>
      r.tipo_refeicao === tipo ? { ...r, [campo]: valor } : r,
    )
    const encontrar = (t: VidaRefeicaoTipo) => atualizadas.find((r) => r.tipo_refeicao === t)
    const todasComProteina = REFEICOES.every((r) => encontrar(r.tipo)?.proteina_ok)
    const almocoEJantarComPrato = encontrar('almoco')?.prato_ok && encontrar('jantar')?.prato_ok

    if (todasComProteina && !codigosConcluidos.includes('proteina_refeicoes')) {
      await marcar('proteina_refeicoes')
    }
    if (almocoEJantarComPrato && !codigosConcluidos.includes('regra_prato')) {
      await marcar('regra_prato')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Jornada — Hoje</h2>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      {ontemFalhou && !minimoJaCumprido && (
        <Card className="border-primary/30 bg-secondary">
          <CardContent className="pt-6">
            <p className="text-sm text-secondary-foreground">
              Ontem não rolou, tudo bem. Hoje o que importa é só o mínimo de 5 minutos.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Zap className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">XP de hoje</p>
              <p className="text-2xl font-semibold">
                {xpHoje} <span className="text-sm font-normal text-muted-foreground">/ {xpMaximoHoje}</span>
              </p>
            </div>
          </div>
          <ProgressBar value={xpHoje} max={xpMaximoHoje} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 pt-6 text-center">
            <p className="text-3xl font-semibold text-primary">{streak?.dias_sem_falhar_duas_seguidas ?? 0}</p>
            <p className="text-xs text-muted-foreground">dias sem falhar 2x seguidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 pt-6 text-center">
            <div className="flex items-center gap-1">
              <Shield className="h-5 w-5 text-primary" />
              <p className="text-3xl font-semibold">{streak?.escudos_disponiveis ?? 0}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              escudos · sequência {streak?.sequencia_atual ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        size="lg"
        variant={minimoJaCumprido ? 'secondary' : 'default'}
        className="h-16 text-base"
        onClick={marcarSoMinimo}
        disabled={minimoJaCumprido}
      >
        {minimoJaCumprido ? (
          <>
            <Check className="h-5 w-5" /> Mínimo do dia cumprido
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" /> Só o mínimo de 5 minutos
          </>
        )}
      </Button>

      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="font-medium">Modo semana pesada</p>
            <p className="text-xs text-muted-foreground">Obra, viagem ou entrega — missões ficam mais leves.</p>
          </div>
          <Button variant={semanaPesada ? 'default' : 'outline'} size="sm" onClick={alternarSemanaPesada}>
            {semanaPesada ? 'Ativado' : 'Ativar'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Missões do dia</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {loadingMissoes && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {diarias.map((missao) => {
            const concluida = codigosConcluidos.includes(missao.codigo)
            const xp = semanaPesada && missao.xp_semana_pesada != null ? missao.xp_semana_pesada : missao.xp
            return (
              <button
                key={missao.codigo}
                type="button"
                disabled={concluida}
                onClick={() => marcar(missao.codigo)}
                className={cn(
                  'flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors',
                  concluida ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted',
                )}
              >
                <span className="flex items-center gap-2">
                  {concluida && <Check className="h-4 w-4 text-primary" />}
                  {missao.nome}
                </span>
                <span className="text-xs text-muted-foreground">{xp} XP</span>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Footprints className="h-4 w-4" /> Passos de hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={registro?.passos?.toString() ?? '0'}
            value={passosInput}
            onChange={(e) => setPassosInput(e.target.value)}
          />
          <Button onClick={salvarPassos}>Salvar</Button>
        </CardContent>
      </Card>

      {sessaoDeHoje && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="h-4 w-4" /> Treino de hoje — {sessaoDeHoje.nome_sessao}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {semanaPesada ? 'Movimento de 15 minutos' : `${sessaoDeHoje.duracao_min_estimado ?? '—'} min`}
            </p>
            <Button variant={treinoJaFeito ? 'secondary' : 'default'} disabled={treinoJaFeito} onClick={marcarTreinoFeito}>
              {treinoJaFeito ? 'Feito' : 'Marcar feito'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Refeições</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {REFEICOES.map(({ tipo, label }) => {
            const refeicao = refeicoes.find((r) => r.tipo_refeicao === tipo)
            return (
              <div key={tipo} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <div className="flex gap-2">
                  <Button
                    variant={refeicao?.proteina_ok ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => alternarRefeicao(tipo, 'proteina_ok', !refeicao?.proteina_ok)}
                  >
                    Proteína
                  </Button>
                  <Button
                    variant={refeicao?.prato_ok ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => alternarRefeicao(tipo, 'prato_ok', !refeicao?.prato_ok)}
                  >
                    Prato
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
