import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { subDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calcularPerdaMediaSemanal, mediaMovel, sugerirAjuste14Dias, type SugestaoAjuste } from '@/lib/rules'
import { useVidaFotos } from '@/hooks/vida/useVidaFotos'
import { useVidaMedidas } from '@/hooks/vida/useVidaMedidas'
import type { VidaFotoAngulo } from '@/types/database'

const TEXTO_SUGESTAO: Record<SugestaoAjuste, string> = {
  reduzir_calorias_ou_somar_passos:
    'O ritmo dos últimos 14 dias está abaixo de 0,3kg/semana. Pode ajudar reduzir 100 a 150 kcal ou somar 2.000 passos ao dia.',
  aumentar_calorias:
    'O ritmo dos últimos 14 dias está acima de 0,9kg/semana. Vale considerar subir um pouco as calorias.',
  manter: 'O ritmo dos últimos 14 dias está dentro do esperado (0,3 a 0,9kg/semana). Pode manter como está.',
}

function formatarData(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function ProgressoPage() {
  const { medidas: pesos } = useVidaMedidas('peso')
  const { medidas: bioimpedancias } = useVidaMedidas('bioimpedancia')
  const { medidas: cinturas } = useVidaMedidas('cintura')
  const { fotos, urls } = useVidaFotos()

  const pesoChart = useMemo(() => {
    const valores = pesos.map((p) => Number(p.valores.peso_kg ?? 0))
    const tendencia = mediaMovel(valores, 3)
    return pesos.map((p, i) => ({
      data: formatarData(p.data),
      bruto: valores[i],
      tendencia: Number(tendencia[i].toFixed(1)),
    }))
  }, [pesos])

  const gorduraChart = useMemo(
    () =>
      bioimpedancias.map((b) => ({
        data: formatarData(b.data),
        gordura: Number(b.valores.massa_gorda_pct ?? 0),
        muscular: Number(b.valores.massa_muscular_esqueletica_kg ?? 0),
      })),
    [bioimpedancias],
  )

  const cinturaChart = useMemo(
    () => cinturas.map((c) => ({ data: formatarData(c.data), cintura: Number(c.valores.cintura_cm ?? 0) })),
    [cinturas],
  )

  const sugestaoAjuste = useMemo(() => {
    const dataCorte = subDays(new Date(), 14).toISOString().slice(0, 10)
    const registrosRecentes = pesos
      .filter((p) => p.data >= dataCorte)
      .map((p) => ({ data: p.data, pesoKg: Number(p.valores.peso_kg ?? 0) }))
    const perdaSemanal = calcularPerdaMediaSemanal(registrosRecentes)
    if (perdaSemanal == null) return null
    return { perdaSemanal, sugestao: sugerirAjuste14Dias(perdaSemanal) }
  }, [pesos])

  const fotosPorAngulo = useMemo(() => {
    const agrupado: Record<VidaFotoAngulo, typeof fotos> = { frente: [], lado: [], costas: [] }
    for (const foto of fotos) agrupado[foto.angulo].push(foto)
    return agrupado
  }, [fotos])

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Progresso</h2>

      {sugestaoAjuste && (
        <Card className="border-primary/30 bg-secondary">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-secondary-foreground">Ajuste de 14 dias</p>
            <p className="mt-1 text-sm text-secondary-foreground">
              Ritmo atual: {sugestaoAjuste.perdaSemanal.toFixed(2)} kg/semana.
            </p>
            <p className="mt-1 text-sm text-secondary-foreground">{TEXTO_SUGESTAO[sugestaoAjuste.sugestao]}</p>
          </CardContent>
        </Card>
      )}

      {pesoChart.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peso (tendência)</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pesoChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="data" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="bruto" stroke="var(--color-muted-foreground)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="tendencia" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {gorduraChart.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">% de gordura e massa muscular</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gorduraChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="data" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="gordura" stroke="var(--color-calories)" strokeWidth={2} dot={false} name="% gordura" />
                <Line type="monotone" dataKey="muscular" stroke="var(--color-workout)" strokeWidth={2} dot={false} name="massa muscular (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {cinturaChart.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cintura</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cinturaChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="data" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="cintura" stroke="var(--color-water)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {fotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fotos — primeira vs. mais recente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {(['frente', 'lado', 'costas'] as VidaFotoAngulo[]).map((angulo) => {
              const lista = fotosPorAngulo[angulo]
              const primeira = lista.at(0)
              const ultima = lista.at(-1)
              return (
                <div key={angulo} className="flex flex-col gap-1">
                  <p className="text-center text-xs capitalize text-muted-foreground">{angulo}</p>
                  <div className="flex gap-1">
                    {primeira && urls[primeira.id] && (
                      <img src={urls[primeira.id]} alt={`${angulo} inicial`} className="aspect-[3/4] w-1/2 rounded-md object-cover" />
                    )}
                    {ultima && ultima.id !== primeira?.id && urls[ultima.id] && (
                      <img src={urls[ultima.id]} alt={`${angulo} recente`} className="aspect-[3/4] w-1/2 rounded-md object-cover" />
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {pesos.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma medida registrada ainda. Comece pela tela Medir.
        </p>
      )}
    </div>
  )
}
