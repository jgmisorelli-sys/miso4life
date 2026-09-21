import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { hojeIso } from '@/lib/vida/date'
import { useVidaFotos } from '@/hooks/vida/useVidaFotos'
import { useVidaMedidas } from '@/hooks/vida/useVidaMedidas'
import type { VidaFotoAngulo } from '@/types/database'

const ANGULOS: { angulo: VidaFotoAngulo; label: string }[] = [
  { angulo: 'frente', label: 'Frente' },
  { angulo: 'lado', label: 'Lado' },
  { angulo: 'costas', label: 'Costas' },
]

export function MedirPage() {
  const { registrar: registrarMedida } = useVidaMedidas()
  const { enviar: enviarFoto } = useVidaFotos()
  const [salvando, setSalvando] = useState<string | null>(null)
  const [confirmouCondicoes, setConfirmouCondicoes] = useState(false)

  async function salvarPeso(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando('peso')
    const form = new FormData(e.currentTarget)
    await registrarMedida(String(form.get('data')), 'peso', {
      peso_kg: Number(form.get('peso_kg')),
    })
    setSalvando(null)
    e.currentTarget.reset()
  }

  async function salvarCintura(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando('cintura')
    const form = new FormData(e.currentTarget)
    await registrarMedida(
      String(form.get('data')),
      'cintura',
      { cintura_cm: Number(form.get('cintura_cm')) },
      String(form.get('ponto_medicao') ?? ''),
    )
    setSalvando(null)
    e.currentTarget.reset()
  }

  async function salvarBioimpedancia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!confirmouCondicoes) return
    setSalvando('bioimpedancia')
    const form = new FormData(e.currentTarget)
    await registrarMedida(String(form.get('data')), 'bioimpedancia', {
      peso_kg: Number(form.get('peso_kg')),
      massa_gorda_kg: Number(form.get('massa_gorda_kg')),
      massa_gorda_pct: Number(form.get('massa_gorda_pct')),
      massa_muscular_esqueletica_kg: Number(form.get('massa_muscular_esqueletica_kg')),
      massa_livre_gordura_kg: form.get('massa_livre_gordura_kg') ? Number(form.get('massa_livre_gordura_kg')) : null,
      gordura_visceral: form.get('gordura_visceral') ? Number(form.get('gordura_visceral')) : null,
      tmb_kcal: form.get('tmb_kcal') ? Number(form.get('tmb_kcal')) : null,
      imc: form.get('imc') ? Number(form.get('imc')) : null,
      whr: form.get('whr') ? Number(form.get('whr')) : null,
    })
    setSalvando(null)
    setConfirmouCondicoes(false)
    e.currentTarget.reset()
  }

  async function salvarCondicionamento(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando('condicionamento')
    const form = new FormData(e.currentTarget)
    await registrarMedida(
      String(form.get('data')),
      'condicionamento',
      {
        distancia_km: Number(form.get('distancia_km')),
        freq_cardiaca_media: Number(form.get('freq_cardiaca_media')),
        duracao_min: 20,
      },
      String(form.get('etapa') ?? ''),
    )
    setSalvando(null)
    e.currentTarget.reset()
  }

  async function enviarFotoDoAngulo(angulo: VidaFotoAngulo, arquivo: File | undefined) {
    if (!arquivo) return
    setSalvando(`foto-${angulo}`)
    await enviarFoto(hojeIso(), angulo, arquivo)
    setSalvando(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Medir</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peso — a cada 3 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={salvarPeso} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="peso-data">Data</Label>
              <Input id="peso-data" name="data" type="date" defaultValue={hojeIso()} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="peso_kg">Peso (kg)</Label>
              <Input id="peso_kg" name="peso_kg" type="number" step="0.1" min="0" required />
            </div>
            <Button type="submit" className="col-span-2" disabled={salvando === 'peso'}>
              Salvar peso
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cintura — semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={salvarCintura} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cintura-data">Data</Label>
              <Input id="cintura-data" name="data" type="date" defaultValue={hojeIso()} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cintura_cm">Cintura (cm)</Label>
              <Input id="cintura_cm" name="cintura_cm" type="number" step="0.1" min="0" required />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="ponto_medicao">Ponto de medição (pra medir sempre no mesmo lugar)</Label>
              <Input id="ponto_medicao" name="ponto_medicao" placeholder="Ex: na altura do umbigo" />
            </div>
            <Button type="submit" className="col-span-2" disabled={salvando === 'cintura'}>
              Salvar cintura
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bioimpedância completa — a cada 14 dias</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="mb-2 font-medium">Antes de medir, confirme:</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={confirmouCondicoes}
                onChange={(e) => setConfirmouCondicoes(e.target.checked)}
              />
              Pela manhã, em jejum, sem treino nas últimas 12h
            </label>
          </div>
          <form onSubmit={salvarBioimpedancia} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio-data">Data</Label>
              <Input id="bio-data" name="data" type="date" defaultValue={hojeIso()} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio-peso_kg">Peso (kg)</Label>
              <Input id="bio-peso_kg" name="peso_kg" type="number" step="0.1" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="massa_gorda_kg">Massa gorda (kg)</Label>
              <Input id="massa_gorda_kg" name="massa_gorda_kg" type="number" step="0.1" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="massa_gorda_pct">Massa gorda (%)</Label>
              <Input id="massa_gorda_pct" name="massa_gorda_pct" type="number" step="0.1" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="massa_muscular_esqueletica_kg">Massa muscular esquelética (kg)</Label>
              <Input id="massa_muscular_esqueletica_kg" name="massa_muscular_esqueletica_kg" type="number" step="0.1" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="massa_livre_gordura_kg">Massa livre de gordura (kg)</Label>
              <Input id="massa_livre_gordura_kg" name="massa_livre_gordura_kg" type="number" step="0.1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gordura_visceral">Gordura visceral (grau)</Label>
              <Input id="gordura_visceral" name="gordura_visceral" type="number" step="1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tmb_kcal">TMB (kcal)</Label>
              <Input id="tmb_kcal" name="tmb_kcal" type="number" step="1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="imc">IMC</Label>
              <Input id="imc" name="imc" type="number" step="0.1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whr">WHR</Label>
              <Input id="whr" name="whr" type="number" step="0.01" />
            </div>
            <Button type="submit" className="col-span-2" disabled={!confirmouCondicoes || salvando === 'bioimpedancia'}>
              Salvar bioimpedância
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Condicionamento — dia 1, chefes de fase e dia 60</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={salvarCondicionamento} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cond-data">Data</Label>
              <Input id="cond-data" name="data" type="date" defaultValue={hojeIso()} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="etapa">Etapa</Label>
              <Input id="etapa" name="etapa" placeholder="Ex: dia 1, chefe fase 1, dia 60" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="distancia_km">Distância em 20 min (km)</Label>
              <Input id="distancia_km" name="distancia_km" type="number" step="0.01" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="freq_cardiaca_media">FC média (bpm)</Label>
              <Input id="freq_cardiaca_media" name="freq_cardiaca_media" type="number" step="1" required />
            </div>
            <Button type="submit" className="col-span-2" disabled={salvando === 'condicionamento'}>
              Salvar condicionamento
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fotos — mensais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {ANGULOS.map(({ angulo, label }) => (
            <div key={angulo} className="flex items-center justify-between gap-3">
              <span className="text-sm">{label}</span>
              <Input
                type="file"
                accept="image/*"
                className="w-auto"
                disabled={salvando === `foto-${angulo}`}
                onChange={(e) => enviarFotoDoAngulo(angulo, e.target.files?.[0])}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
