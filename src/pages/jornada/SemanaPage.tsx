import { useMemo } from 'react'
import { Check, Dumbbell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn } from '@/lib/utils'
import { avaliarRecompensaSemanal } from '@/lib/rules'
import { diaSemanaDe, hojeIso, semanaAtualIntervalo } from '@/lib/vida/date'
import { useVidaMissoesConfig } from '@/hooks/vida/useVidaMissoesConfig'
import { useVidaMissoesFeitas } from '@/hooks/vida/useVidaMissoesFeitas'
import { useVidaTreinosFeitos } from '@/hooks/vida/useVidaTreinosFeitos'
import { useVidaTreinosPlano } from '@/hooks/vida/useVidaTreinosPlano'

const META_XP_SEMANAL = 650
const META_TREINOS_SEMANAL = 4

export function SemanaPage() {
  const { inicio, fim } = semanaAtualIntervalo()
  const hoje = hojeIso()

  const { semanais } = useVidaMissoesConfig()
  const { feitas, codigosConcluidos, marcar } = useVidaMissoesFeitas(inicio, fim)
  const { sessoes } = useVidaTreinosPlano()
  const { feitos: treinosFeitos } = useVidaTreinosFeitos(inicio, fim)

  const xpSemana = useMemo(() => feitas.reduce((total, f) => total + f.xp_concedido, 0), [feitas])
  const treinosConcluidos = treinosFeitos.length
  const recompensaLiberada = avaliarRecompensaSemanal(xpSemana, treinosConcluidos, {
    xp_min: META_XP_SEMANAL,
    treinos_min: META_TREINOS_SEMANAL,
  })

  const diasComTreinoFeito = new Set(treinosFeitos.map((t) => t.data))

  async function marcarMissaoSemanal(codigo: string, xp: number) {
    await marcar(hoje, codigo, xp)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Jornada — Semana</h2>
        <p className="text-sm text-muted-foreground">
          {new Date(`${inicio}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a{' '}
          {new Date(`${fim}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">XP da semana</p>
            <p className="text-2xl font-semibold">
              {xpSemana} <span className="text-sm font-normal text-muted-foreground">/ {META_XP_SEMANAL}</span>
            </p>
          </div>
          <ProgressBar value={xpSemana} max={META_XP_SEMANAL} />
          {recompensaLiberada && (
            <p className="text-sm font-medium text-primary">
              Recompensa semanal liberada! Refeição livre planejada + 2h de tempo livre.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-4 w-4" /> Treinos da semana ({treinosConcluidos}/{META_TREINOS_SEMANAL})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {sessoes.map((sessao) => {
            const dataDaSessaoNaSemana = diasDaSemana(inicio).find((d) => diaSemanaDe(d) === sessao.dia_semana)
            const feito = dataDaSessaoNaSemana ? diasComTreinoFeito.has(dataDaSessaoNaSemana) : false
            return (
              <div key={sessao.id} className="flex items-center justify-between text-sm">
                <span className={cn(feito && 'text-muted-foreground line-through')}>
                  {sessao.nome_sessao} {sessao.fixo && <span className="text-xs text-primary">(fixo)</span>}
                </span>
                {feito && <Check className="h-4 w-4 text-primary" />}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Missões semanais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {semanais.map((missao) => {
            const concluida = codigosConcluidos.includes(missao.codigo)
            return (
              <button
                key={missao.codigo}
                type="button"
                disabled={concluida}
                onClick={() => marcarMissaoSemanal(missao.codigo, missao.xp)}
                className={cn(
                  'flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors',
                  concluida ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted',
                )}
              >
                <span className="flex items-center gap-2">
                  {concluida && <Check className="h-4 w-4 text-primary" />}
                  {missao.nome}
                </span>
                <span className="text-xs text-muted-foreground">{missao.xp} XP</span>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Button variant="outline" size="sm" className="self-start" disabled>
        Recompensa: resgate manual (tela Recompensas — Fase 5)
      </Button>
    </div>
  )
}

function diasDaSemana(inicioIso: string): string[] {
  const dias: string[] = []
  const base = new Date(`${inicioIso}T00:00:00`)
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    dias.push(d.toISOString().slice(0, 10))
  }
  return dias
}
