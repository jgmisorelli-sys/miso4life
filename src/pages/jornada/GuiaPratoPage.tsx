import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useVidaAlimentosCatalogo } from '@/hooks/vida/useVidaAlimentosCatalogo'
import { useVidaEventosSociais } from '@/hooks/vida/useVidaEventosSociais'
import type { VidaAlimentoCategoria } from '@/types/database'

const REGRAS_PRATO = [
  'Prato: metade vegetais, 1,5 palma de proteína, 1 punho de carboidrato, 1 polegar de gordura.',
  'Proteína em todas as refeições, incluindo o café da manhã até as 9h.',
  'Líquido calórico zero. Refrigerante vira prêmio.',
  'Café: até 4 xicrinhas, a última até 15h.',
  'Jantar pelo menos 3h antes de deitar. Em noites de ensaio e culto: jantar antes de sair ou refeição leve depois.',
  'Refeição livre planejada uma vez por semana, como prêmio.',
  'Protocolo de evento social: lanche com proteína antes, regra do prato, uma escolha livre e pronto.',
]

const CATEGORIAS: { value: VidaAlimentoCategoria; label: string }[] = [
  { value: 'proteina', label: 'Proteína' },
  { value: 'carboidrato', label: 'Carboidrato' },
  { value: 'gordura', label: 'Gordura' },
  { value: 'vegetal', label: 'Vegetal' },
  { value: 'outro', label: 'Outro' },
]

export function GuiaPratoPage() {
  const { pendentesDeConfirmacao, registrarEvento, confirmarProtocolo } = useVidaEventosSociais()
  const { alimentos, adicionar, alternarAtivo } = useVidaAlimentosCatalogo()

  const [descricaoEvento, setDescricaoEvento] = useState('')
  const [novoAlimento, setNovoAlimento] = useState({
    nome: '',
    categoria: 'proteina' as VidaAlimentoCategoria,
    porcao_label: '1 palma',
    kcal: '',
    proteina: '',
    carboidrato: '',
    gordura: '',
    fibra: '',
  })

  async function handleRegistrarEvento(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!descricaoEvento) return
    await registrarEvento(descricaoEvento)
    setDescricaoEvento('')
  }

  async function handleAdicionarAlimento(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!novoAlimento.nome || !novoAlimento.kcal) return
    await adicionar({
      nome: novoAlimento.nome,
      categoria: novoAlimento.categoria,
      porcao_label: novoAlimento.porcao_label,
      kcal_por_porcao: Number(novoAlimento.kcal),
      proteina_g_por_porcao: novoAlimento.proteina ? Number(novoAlimento.proteina) : undefined,
      carboidrato_g_por_porcao: novoAlimento.carboidrato ? Number(novoAlimento.carboidrato) : undefined,
      gordura_g_por_porcao: novoAlimento.gordura ? Number(novoAlimento.gordura) : undefined,
      fibra_g_por_porcao: novoAlimento.fibra ? Number(novoAlimento.fibra) : undefined,
    })
    setNovoAlimento({
      nome: '',
      categoria: 'proteina',
      porcao_label: '1 palma',
      kcal: '',
      proteina: '',
      carboidrato: '',
      gordura: '',
      fibra: '',
    })
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
              <div>
                <p className={a.ativo ? '' : 'text-muted-foreground line-through'}>
                  {a.nome} — {a.porcao_label} = {a.kcal_por_porcao} kcal
                  {a.proteina_g_por_porcao != null && `, ${a.proteina_g_por_porcao}g proteína`}
                  {a.fibra_g_por_porcao != null && `, ${a.fibra_g_por_porcao}g fibra`}
                </p>
                <p className="text-xs capitalize text-muted-foreground">{a.categoria}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => alternarAtivo(a.id, !a.ativo)}>
                {a.ativo ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          ))}

          <form onSubmit={handleAdicionarAlimento} className="grid grid-cols-2 gap-2 pt-2">
            <Input
              placeholder="Nome (ex: peito de frango)"
              value={novoAlimento.nome}
              onChange={(e) => setNovoAlimento({ ...novoAlimento, nome: e.target.value })}
              className="col-span-2"
            />
            <select
              className="col-span-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={novoAlimento.categoria}
              onChange={(e) => setNovoAlimento({ ...novoAlimento, categoria: e.target.value as VidaAlimentoCategoria })}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <Input
              placeholder="Porção (ex: 1 palma)"
              value={novoAlimento.porcao_label}
              onChange={(e) => setNovoAlimento({ ...novoAlimento, porcao_label: e.target.value })}
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
            <Button type="submit" className="col-span-2">
              Adicionar ao catálogo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
