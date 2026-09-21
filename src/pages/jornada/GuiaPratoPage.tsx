import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useVidaAlimentosCatalogo, type NovoAlimento } from '@/hooks/vida/useVidaAlimentosCatalogo'
import { useVidaEventosSociais } from '@/hooks/vida/useVidaEventosSociais'
import { useVidaExerciciosCatalogo, type NovoExercicio } from '@/hooks/vida/useVidaExerciciosCatalogo'

const REGRAS_PRATO = [
  'Prato: metade vegetais, 1,5 palma de proteína, 1 punho de carboidrato, 1 polegar de gordura.',
  'Proteína em todas as refeições, incluindo o café da manhã até as 9h.',
  'Líquido calórico zero. Refrigerante vira prêmio.',
  'Café: até 4 xicrinhas, a última até 15h.',
  'Jantar pelo menos 3h antes de deitar. Em noites de ensaio e culto: jantar antes de sair ou refeição leve depois.',
  'Refeição livre planejada uma vez por semana, como prêmio.',
  'Protocolo de evento social: lanche com proteína antes, regra do prato, uma escolha livre e pronto.',
]

const ALIMENTO_VAZIO = { nome: '', porcao_label: '', kcal: '', proteina: '', carboidrato: '', gordura: '', fibra: '' }
const EXERCICIO_VAZIO = { nome: '', kcalPorMinuto: '', duracao: '' }

export function GuiaPratoPage() {
  const { pendentesDeConfirmacao, registrarEvento, confirmarProtocolo } = useVidaEventosSociais()
  const { alimentos, adicionar, atualizar, alternarAtivo } = useVidaAlimentosCatalogo()
  const {
    exercicios,
    adicionar: adicionarExercicio,
    atualizar: atualizarExercicio,
    alternarAtivo: alternarAtivoExercicio,
  } = useVidaExerciciosCatalogo()

  const [descricaoEvento, setDescricaoEvento] = useState('')

  const [novoAlimento, setNovoAlimento] = useState(ALIMENTO_VAZIO)
  const [editandoAlimentoId, setEditandoAlimentoId] = useState<string | null>(null)

  const [novoExercicio, setNovoExercicio] = useState(EXERCICIO_VAZIO)
  const [editandoExercicioId, setEditandoExercicioId] = useState<string | null>(null)

  async function handleRegistrarEvento(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!descricaoEvento) return
    await registrarEvento(descricaoEvento)
    setDescricaoEvento('')
  }

  function editarAlimento(alimento: (typeof alimentos)[number]) {
    setEditandoAlimentoId(alimento.id)
    setNovoAlimento({
      nome: alimento.nome,
      porcao_label: alimento.porcao_label,
      kcal: String(alimento.kcal_por_porcao),
      proteina: alimento.proteina_g_por_porcao != null ? String(alimento.proteina_g_por_porcao) : '',
      carboidrato: alimento.carboidrato_g_por_porcao != null ? String(alimento.carboidrato_g_por_porcao) : '',
      gordura: alimento.gordura_g_por_porcao != null ? String(alimento.gordura_g_por_porcao) : '',
      fibra: alimento.fibra_g_por_porcao != null ? String(alimento.fibra_g_por_porcao) : '',
    })
  }

  function cancelarEdicaoAlimento() {
    setEditandoAlimentoId(null)
    setNovoAlimento(ALIMENTO_VAZIO)
  }

  async function handleSalvarAlimento(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!novoAlimento.nome || !novoAlimento.kcal) return
    const dados: NovoAlimento = {
      nome: novoAlimento.nome,
      categoria: 'outro',
      porcao_label: novoAlimento.porcao_label || '1 porção',
      kcal_por_porcao: Number(novoAlimento.kcal),
      proteina_g_por_porcao: novoAlimento.proteina ? Number(novoAlimento.proteina) : undefined,
      carboidrato_g_por_porcao: novoAlimento.carboidrato ? Number(novoAlimento.carboidrato) : undefined,
      gordura_g_por_porcao: novoAlimento.gordura ? Number(novoAlimento.gordura) : undefined,
      fibra_g_por_porcao: novoAlimento.fibra ? Number(novoAlimento.fibra) : undefined,
    }
    if (editandoAlimentoId) await atualizar(editandoAlimentoId, dados)
    else await adicionar(dados)
    cancelarEdicaoAlimento()
  }

  function editarExercicio(exercicio: (typeof exercicios)[number]) {
    setEditandoExercicioId(exercicio.id)
    setNovoExercicio({
      nome: exercicio.nome,
      kcalPorMinuto: exercicio.kcal_por_minuto != null ? String(exercicio.kcal_por_minuto) : '',
      duracao: exercicio.duracao_min_estimado != null ? String(exercicio.duracao_min_estimado) : '',
    })
  }

  function cancelarEdicaoExercicio() {
    setEditandoExercicioId(null)
    setNovoExercicio(EXERCICIO_VAZIO)
  }

  async function handleSalvarExercicio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!novoExercicio.nome || !novoExercicio.kcalPorMinuto) return
    const kcalPorMinuto = Number(novoExercicio.kcalPorMinuto)
    const duracao = novoExercicio.duracao ? Number(novoExercicio.duracao) : undefined
    const dados: NovoExercicio = {
      nome: novoExercicio.nome,
      categoria: 'outro',
      kcal_por_minuto: kcalPorMinuto,
      duracao_min_estimado: duracao,
      kcal_estimado: kcalPorMinuto * (duracao ?? 0),
    }
    if (editandoExercicioId) await atualizarExercicio(editandoExercicioId, dados)
    else await adicionarExercicio(dados)
    cancelarEdicaoExercicio()
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Guia do prato</h2>

      <div className="flex flex-col gap-2">
        {REGRAS_PRATO.map((regra, i) => (
          <Card key={i}>
            <CardContent className="pt-6 text-sm">{regra}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evento social</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {pendentesDeConfirmacao.map((evento) => (
            <div key={evento.id} className="rounded-lg bg-muted p-3">
              <p className="text-sm">
                {evento.descricao} ({evento.data}) — o protocolo foi cumprido?
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => confirmarProtocolo(evento.id, true)}>
                  Sim
                </Button>
                <Button size="sm" variant="outline" onClick={() => confirmarProtocolo(evento.id, false)}>
                  Não
                </Button>
              </div>
            </div>
          ))}
          <form onSubmit={handleRegistrarEvento} className="flex gap-2">
            <Input
              placeholder="Vou a um evento social — qual?"
              value={descricaoEvento}
              onChange={(e) => setDescricaoEvento(e.target.value)}
            />
            <Button type="submit">Registrar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catálogo de alimentos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {alimentos.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <p className={a.ativo ? '' : 'text-muted-foreground line-through'}>
                {a.nome} — {a.porcao_label} = {a.kcal_por_porcao} kcal
                {a.proteina_g_por_porcao != null && `, ${a.proteina_g_por_porcao}g proteína`}
                {a.fibra_g_por_porcao != null && `, ${a.fibra_g_por_porcao}g fibra`}
              </p>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => editarAlimento(a)}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => alternarAtivo(a.id, !a.ativo)}>
                  {a.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          ))}

          <form onSubmit={handleSalvarAlimento} className="grid grid-cols-2 gap-2 pt-2">
            {editandoAlimentoId && (
              <p className="col-span-2 text-xs font-medium text-primary">Editando "{novoAlimento.nome}"</p>
            )}
            <Input
              placeholder="Nome (ex: peito de frango)"
              value={novoAlimento.nome}
              onChange={(e) => setNovoAlimento({ ...novoAlimento, nome: e.target.value })}
              className="col-span-2"
            />
            <Input
              placeholder="Porção (ex: 100g, 1 unidade, 1 palma)"
              value={novoAlimento.porcao_label}
              onChange={(e) => setNovoAlimento({ ...novoAlimento, porcao_label: e.target.value })}
              className="col-span-2"
            />
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Kcal por porção</Label>
              <Input
                type="number"
                value={novoAlimento.kcal}
                onChange={(e) => setNovoAlimento({ ...novoAlimento, kcal: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Proteína (g)</Label>
              <Input
                type="number"
                value={novoAlimento.proteina}
                onChange={(e) => setNovoAlimento({ ...novoAlimento, proteina: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Gordura (g)</Label>
              <Input
                type="number"
                value={novoAlimento.gordura}
                onChange={(e) => setNovoAlimento({ ...novoAlimento, gordura: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Carboidrato (g)</Label>
              <Input
                type="number"
                value={novoAlimento.carboidrato}
                onChange={(e) => setNovoAlimento({ ...novoAlimento, carboidrato: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Fibra (g)</Label>
              <Input
                type="number"
                value={novoAlimento.fibra}
                onChange={(e) => setNovoAlimento({ ...novoAlimento, fibra: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" className="flex-1">
                {editandoAlimentoId ? 'Salvar alterações' : 'Adicionar ao catálogo'}
              </Button>
              {editandoAlimentoId && (
                <Button type="button" variant="outline" onClick={cancelarEdicaoAlimento}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catálogo de exercícios</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Cadastre por kcal/minuto -- na tela Hoje você informa quanto tempo treinou e o app calcula o gasto total.
            Qualquer exercício daqui cumpre a missão de treino se bater a meta de kcal do dia.
          </p>
          {exercicios.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between text-sm">
              <p className={ex.ativo ? '' : 'text-muted-foreground line-through'}>
                {ex.nome} — {ex.kcal_por_minuto ?? '—'} kcal/min
                {ex.duracao_min_estimado != null && ` · ${ex.duracao_min_estimado} min`}
              </p>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => editarExercicio(ex)}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => alternarAtivoExercicio(ex.id, !ex.ativo)}>
                  {ex.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          ))}

          <form onSubmit={handleSalvarExercicio} className="grid grid-cols-2 gap-2 pt-2">
            {editandoExercicioId && (
              <p className="col-span-2 text-xs font-medium text-primary">Editando "{novoExercicio.nome}"</p>
            )}
            <Input
              placeholder="Nome (ex: corrida)"
              value={novoExercicio.nome}
              onChange={(e) => setNovoExercicio({ ...novoExercicio, nome: e.target.value })}
              className="col-span-2"
            />
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Kcal por minuto</Label>
              <Input
                type="number"
                step="0.1"
                value={novoExercicio.kcalPorMinuto}
                onChange={(e) => setNovoExercicio({ ...novoExercicio, kcalPorMinuto: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Duração típica (min)</Label>
              <Input
                type="number"
                value={novoExercicio.duracao}
                onChange={(e) => setNovoExercicio({ ...novoExercicio, duracao: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" className="flex-1">
                {editandoExercicioId ? 'Salvar alterações' : 'Adicionar ao catálogo'}
              </Button>
              {editandoExercicioId && (
                <Button type="button" variant="outline" onClick={cancelarEdicaoExercicio}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
