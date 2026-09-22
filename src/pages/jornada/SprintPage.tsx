import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { progressoSprint } from '@/lib/rules'
import { hojeIso } from '@/lib/vida/date'
import { garantirRecompensaSprint } from '@/lib/vida/rewardsSync'
import { useVidaFases } from '@/hooks/vida/useVidaFases'
import { useVidaSprints, somarXpNoPeriodo } from '@/hooks/vida/useVidaSprints'
import type { Database } from '@/types/database'

type RecompensaConfigRow = Database['public']['Tables']['vida_recompensas_config']['Row']

export function SprintPage() {
  const { user } = useAuth()
  const { sprintAtivo, sprints } = useVidaSprints()
  const { fases } = useVidaFases()
  const [xpSprint, setXpSprint] = useState(0)
  const [premioSprint, setPremioSprint] = useState<RecompensaConfigRow | null>(null)

  useEffect(() => {
    if (!user || !sprintAtivo) return
    somarXpNoPeriodo(user.id, sprintAtivo.data_inicio, sprintAtivo.data_fim).then(async (xp) => {
      setXpSprint(xp)
      await garantirRecompensaSprint(user.id, sprintAtivo.id, xp)
    })
  }, [user, sprintAtivo])

  useEffect(() => {
    if (!user) return
    supabase
      .from('vida_recompensas_config')
      .select('*')
      .eq('user_id', user.id)
      .eq('gatilho', 'sprint_800_xp')
      .maybeSingle()
      .then(({ data }) => setPremioSprint(data))
  }, [user])

  if (!sprintAtivo) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Sprint</h2>
        <p className="text-sm text-muted-foreground">Nenhum sprint ativo no momento.</p>
      </div>
    )
  }

  const fase = fases.find((f) => f.id === sprintAtivo.fase_id)
  const progresso = progressoSprint(xpSprint, sprintAtivo.meta_xp, sprintAtivo.data_fim, hojeIso())

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Sprint {sprintAtivo.numero} — {sprintAtivo.tema}</h2>
        {fase && <p className="text-sm text-muted-foreground">Fase {fase.numero}: {fase.nome}</p>}
      </div>

      <Card className="bg-muted">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Um sprint é um bloco de 10 dias com um tema específico (ex: "proteína e prato", "progressão de força").
          Cada fase do plano (como a Fase 1, de 60 dias) é dividida em 6 sprints seguidos -- é só uma forma de
          quebrar a fase em metas curtas, já que você rende melhor com desafios de poucos dias. O XP que você ganha
          nas missões do dia a dia conta pra esse sprint; batendo a meta de XP dele, libera um prêmio.
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">XP do sprint</p>
            <p className="text-2xl font-semibold">
              {xpSprint} <span className="text-sm font-normal text-muted-foreground">/ {sprintAtivo.meta_xp}</span>
            </p>
          </div>
          <ProgressBar value={xpSprint} max={sprintAtivo.meta_xp} />
          <p className="text-sm text-muted-foreground">
            {progresso.diasRestantes} dia(s) restante(s)
            {progresso.metaAtingida && ' — meta atingida!'}
          </p>
        </CardContent>
      </Card>

      {premioSprint && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" /> Próximo prêmio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {premioSprint.nome} — R$ {premioSprint.valor.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todos os sprints da fase</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {sprints
            .filter((s) => s.fase_id === sprintAtivo.fase_id)
            .map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.numero}. {s.tema}</span>
                <span className="text-xs capitalize text-muted-foreground">{s.status}</span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
