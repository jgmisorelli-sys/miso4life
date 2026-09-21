import { useEffect, useState, type FormEvent } from 'react'
import { Bell, Download, MessageCircle, ShieldAlert, Target, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { excluirMeusDados } from '@/lib/vida/dataDelete'
import { exportarDadosCsv, exportarDadosJson } from '@/lib/vida/dataExport'
import { usePushNotifications } from '@/hooks/vida/usePushNotifications'
import { useVidaFamiliaParticipantes } from '@/hooks/vida/useVidaFamiliaParticipantes'
import { useVidaLembretesConfig } from '@/hooks/vida/useVidaLembretesConfig'
import { useVidaPerfil } from '@/hooks/vida/useVidaPerfil'
import type { VidaLembreteTipo } from '@/types/database'

const NOME_LEMBRETE: Record<VidaLembreteTipo, string> = {
  manha: 'Missão do dia (manhã)',
  janela_treino: 'Janela de treino (tarde)',
  fechamento_dia: 'Fechamento do dia (noite)',
  resumo_semana: 'Resumo da semana (domingo)',
  pre_bioimpedancia: 'Antes da bioimpedância',
}

export function ConfiguracoesPage() {
  const { user } = useAuth()
  const { suportado, inscrito, carregando, ativar, desativar } = usePushNotifications()
  const { lembretes, atualizar } = useVidaLembretesConfig()
  const { participantes, adicionar, alternarAtivo } = useVidaFamiliaParticipantes()
  const { perfil, salvar: salvarPerfil } = useVidaPerfil()
  const [novoParticipante, setNovoParticipante] = useState('')
  const [exportando, setExportando] = useState<'json' | 'csv' | null>(null)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [salvandoMetas, setSalvandoMetas] = useState(false)
  const [metas, setMetas] = useState({
    meta_calorias_kcal: '',
    meta_proteina_g: '',
    meta_gordura_g: '',
    meta_carboidrato_g: '',
    meta_fibra_g: '',
    meta_passos: '',
    meta_sono_horas: '',
  })

  useEffect(() => {
    if (!perfil) return
    setMetas({
      meta_calorias_kcal: String(perfil.meta_calorias_kcal),
      meta_proteina_g: String(perfil.meta_proteina_g),
      meta_gordura_g: String(perfil.meta_gordura_g),
      meta_carboidrato_g: String(perfil.meta_carboidrato_g),
      meta_fibra_g: String(perfil.meta_fibra_g),
      meta_passos: String(perfil.meta_passos),
      meta_sono_horas: String(perfil.meta_sono_horas),
    })
  }, [perfil])

  async function handleSalvarMetas(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvandoMetas(true)
    await salvarPerfil({
      meta_calorias_kcal: Number(metas.meta_calorias_kcal),
      meta_proteina_g: Number(metas.meta_proteina_g),
      meta_gordura_g: Number(metas.meta_gordura_g),
      meta_carboidrato_g: Number(metas.meta_carboidrato_g),
      meta_fibra_g: Number(metas.meta_fibra_g),
      meta_passos: Number(metas.meta_passos),
      meta_sono_horas: Number(metas.meta_sono_horas),
    })
    setSalvandoMetas(false)
  }

  async function handleAdicionarParticipante(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!novoParticipante) return
    await adicionar(novoParticipante)
    setNovoParticipante('')
  }

  async function handleExportar(formato: 'json' | 'csv') {
    if (!user) return
    setExportando(formato)
    if (formato === 'json') await exportarDadosJson(user.id)
    else await exportarDadosCsv(user.id)
    setExportando(null)
  }

  async function handleExcluirDados() {
    if (!user) return
    setExcluindo(true)
    await excluirMeusDados(user.id)
    setExcluindo(false)
    setConfirmandoExclusao(false)
    await supabase.auth.signOut()
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Configurações</h2>

      <Card className="border-muted-foreground/20 bg-muted">
        <CardContent className="flex items-start gap-2 pt-6 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Este plano é orientação estruturada e não substitui avaliação médica e nutricional presencial.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" /> Metas diárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSalvarMetas} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meta_calorias_kcal">Calorias (kcal)</Label>
              <Input
                id="meta_calorias_kcal"
                type="number"
                value={metas.meta_calorias_kcal}
                onChange={(e) => setMetas({ ...metas, meta_calorias_kcal: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meta_proteina_g">Proteína (g)</Label>
              <Input
                id="meta_proteina_g"
                type="number"
                value={metas.meta_proteina_g}
                onChange={(e) => setMetas({ ...metas, meta_proteina_g: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meta_gordura_g">Gordura (g)</Label>
              <Input
                id="meta_gordura_g"
                type="number"
                value={metas.meta_gordura_g}
                onChange={(e) => setMetas({ ...metas, meta_gordura_g: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meta_carboidrato_g">Carboidrato (g)</Label>
              <Input
                id="meta_carboidrato_g"
                type="number"
                value={metas.meta_carboidrato_g}
                onChange={(e) => setMetas({ ...metas, meta_carboidrato_g: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meta_fibra_g">Fibra (g)</Label>
              <Input
                id="meta_fibra_g"
                type="number"
                value={metas.meta_fibra_g}
                onChange={(e) => setMetas({ ...metas, meta_fibra_g: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meta_passos">Passos</Label>
              <Input
                id="meta_passos"
                type="number"
                value={metas.meta_passos}
                onChange={(e) => setMetas({ ...metas, meta_passos: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meta_sono_horas">Sono (horas)</Label>
              <Input
                id="meta_sono_horas"
                type="number"
                step="0.5"
                value={metas.meta_sono_horas}
                onChange={(e) => setMetas({ ...metas, meta_sono_horas: e.target.value })}
              />
            </div>
            <Button type="submit" className="col-span-2" disabled={salvandoMetas}>
              Salvar metas
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" /> Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!suportado && (
            <p className="text-sm text-muted-foreground">
              Seu navegador não suporta notificações push. Funciona melhor instalando o app na tela inicial.
            </p>
          )}
          {suportado && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {inscrito ? 'Notificações ativadas neste dispositivo.' : 'Ative pra receber os lembretes do dia.'}
              </p>
              <Button
                variant={inscrito ? 'outline' : 'default'}
                size="sm"
                disabled={carregando}
                onClick={inscrito ? desativar : ativar}
              >
                {inscrito ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Horários dos lembretes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {lembretes.map((lembrete) => (
            <div key={lembrete.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm">{NOME_LEMBRETE[lembrete.tipo]}</p>
                {lembrete.horario && <p className="text-xs text-muted-foreground">{lembrete.horario.slice(0, 5)}</p>}
              </div>
              <div className="flex items-center gap-2">
                {lembrete.horario && (
                  <Input
                    type="time"
                    className="w-28"
                    defaultValue={lembrete.horario.slice(0, 5)}
                    onBlur={(e) => atualizar(lembrete.id, { horario: e.target.value })}
                  />
                )}
                <Button
                  variant={lembrete.ativo ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => atualizar(lembrete.id, { ativo: !lembrete.ativo })}
                >
                  {lembrete.ativo ? 'Ativo' : 'Desligado'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Participantes da família (bônus)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {participantes.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span className={p.ativo ? '' : 'text-muted-foreground line-through'}>{p.nome}</span>
              <Button variant="ghost" size="sm" onClick={() => alternarAtivo(p.id, !p.ativo)}>
                {p.ativo ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          ))}
          <form onSubmit={handleAdicionarParticipante} className="flex gap-2">
            <Input
              placeholder="Nome"
              value={novoParticipante}
              onChange={(e) => setNovoParticipante(e.target.value)}
            />
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" /> Canal WhatsApp — decisão pendente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">
            O envio real ainda não foi implementado. A interface de canal já está pronta
            (<code>src/lib/vida/notifications/whatsappProvider.ts</code>); falta escolher o provedor. Três opções:
          </p>
          <div className="rounded-lg border border-border p-3">
            <p className="font-medium">WhatsApp Cloud API (oficial, Meta) — recomendado</p>
            <p className="text-muted-foreground">
              Gratuito até um volume alto de mensagens, direto da Meta, mais estável a longo prazo. Exige criar um
              app no Meta for Developers e verificar um número. Configuração inicial mais burocrática.
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="font-medium">Evolution API</p>
            <p className="text-muted-foreground">
              Open source, você mesmo hospeda (cabe na sua VPS EasyPanel). Sem custo por mensagem, mas usa o WhatsApp
              normal via QR code — risco de bloqueio do número se usar agressivamente, e você é responsável por manter
              o serviço no ar.
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="font-medium">Z-API</p>
            <p className="text-muted-foreground">
              Serviço brasileiro pago, configuração rápida, também via QR code (mesmo risco de bloqueio, mas o
              provedor cuida da infraestrutura). Bom custo-benefício pra baixo volume de mensagens pessoais.
            </p>
          </div>
          <p className="text-muted-foreground">
            Por enquanto, os lembretes funcionam por notificação push (acima), que não depende de nenhum provedor
            externo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4" /> Exportar meus dados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Baixa tudo o que o módulo Jornada guarda sobre você: perfil, fases, sprints, missões, refeições, treinos,
            medidas, fotos, recompensas e conquistas.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={exportando !== null} onClick={() => handleExportar('json')}>
              {exportando === 'json' ? 'Gerando...' : 'Baixar JSON'}
            </Button>
            <Button variant="outline" size="sm" disabled={exportando !== null} onClick={() => handleExportar('csv')}>
              {exportando === 'csv' ? 'Gerando...' : 'Baixar CSV (.zip)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-4 w-4" /> Excluir meus dados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Apaga permanentemente todos os dados do módulo Jornada (não apaga sua conta nem o resto do miso4life).
            Não tem como desfazer -- exporte antes se quiser guardar uma cópia.
          </p>
          {!confirmandoExclusao ? (
            <Button variant="destructive" size="sm" className="self-start" onClick={() => setConfirmandoExclusao(true)}>
              Excluir meus dados
            </Button>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 p-3">
              <p className="text-sm font-medium text-destructive">Tem certeza? Isso não pode ser desfeito.</p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" disabled={excluindo} onClick={handleExcluirDados}>
                  {excluindo ? 'Excluindo...' : 'Sim, excluir tudo'}
                </Button>
                <Button variant="outline" size="sm" disabled={excluindo} onClick={() => setConfirmandoExclusao(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
