import { useMemo, useState, type FormEvent } from 'react'
import { Gift, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useVidaDesejos } from '@/hooks/vida/useVidaDesejos'
import { useVidaRecompensas } from '@/hooks/vida/useVidaRecompensas'

const COFRE_MENSAL_REAIS = 1000

export function RecompensasPage() {
  const { disponiveis, resgatadas, loading, resgatar } = useVidaRecompensas()
  const { desejos, adicionar: adicionarDesejo, remover: removerDesejo } = useVidaDesejos()
  const [novoDesejo, setNovoDesejo] = useState({ nome: '', valor: '', link: '' })

  const conquistadoNoMes = useMemo(() => {
    const mesAtual = new Date().toISOString().slice(0, 7)
    return [...disponiveis, ...resgatadas]
      .filter((r) => r.data_conquista?.startsWith(mesAtual))
      .reduce((total, r) => total + (r.valor ?? 0), 0)
  }, [disponiveis, resgatadas])

  async function handleAdicionarDesejo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!novoDesejo.nome) return
    await adicionarDesejo(
      novoDesejo.nome,
      novoDesejo.valor ? Number(novoDesejo.valor) : undefined,
      novoDesejo.link || undefined,
    )
    setNovoDesejo({ nome: '', valor: '', link: '' })
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Recompensas</h2>

      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Cofre do mês</p>
            <p className="text-2xl font-semibold">R$ {COFRE_MENSAL_REAIS.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Conquistado no mês</p>
            <p className="text-lg font-medium text-primary">R$ {conquistadoNoMes.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-4 w-4" /> Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {!loading && disponiveis.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma recompensa disponível ainda.</p>
          )}
          {disponiveis.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium capitalize">{r.referencia_tipo}</p>
                {r.valor != null && r.valor > 0 && (
                  <p className="text-xs text-muted-foreground">R$ {r.valor.toFixed(2)}</p>
                )}
              </div>
              <Button size="sm" onClick={() => resgatar(r.id)}>
                Resgatar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {resgatadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resgatadas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {resgatadas.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="capitalize">{r.referencia_tipo}</span>
                <span>{r.data_resgate}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4" /> Lista de desejos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {desejos.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <div>
                <p>{d.nome}</p>
                {d.valor_estimado != null && (
                  <p className="text-xs text-muted-foreground">R$ {d.valor_estimado.toFixed(2)}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => removerDesejo(d.id)}>
                Remover
              </Button>
            </div>
          ))}
          <form onSubmit={handleAdicionarDesejo} className="grid grid-cols-2 gap-2 pt-2">
            <Input
              placeholder="Nome do item"
              value={novoDesejo.nome}
              onChange={(e) => setNovoDesejo({ ...novoDesejo, nome: e.target.value })}
              className="col-span-2"
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Valor (R$)"
              value={novoDesejo.valor}
              onChange={(e) => setNovoDesejo({ ...novoDesejo, valor: e.target.value })}
            />
            <Input
              placeholder="Link (opcional)"
              value={novoDesejo.link}
              onChange={(e) => setNovoDesejo({ ...novoDesejo, link: e.target.value })}
            />
            <Button type="submit" className="col-span-2">
              Adicionar desejo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
