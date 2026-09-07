import { useState, type FormEvent } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBodyLogs } from '@/hooks/useBodyLogs'
import { useProfile } from '@/hooks/useProfile'

export function ProgressPage() {
  const { logs, addBodyLog } = useBodyLogs()
  const { profile } = useProfile()
  const [saving, setSaving] = useState(false)

  const chartData = logs.map((log) => ({
    date: new Date(log.logged_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    weight: log.weight_kg,
  }))

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    await addBodyLog({
      weight_kg: Number(form.get('weight_kg')),
      body_fat_pct: form.get('body_fat_pct') ? Number(form.get('body_fat_pct')) : undefined,
      waist_cm: form.get('waist_cm') ? Number(form.get('waist_cm')) : undefined,
      hip_cm: form.get('hip_cm') ? Number(form.get('hip_cm')) : undefined,
    })
    setSaving(false)
    e.currentTarget.reset()
  }

  const latestWeight = logs.at(-1)?.weight_kg
  const targetWeight = profile?.target_weight_kg

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Progresso</h2>

      {latestWeight != null && (
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Peso atual</p>
              <p className="text-2xl font-semibold">{latestWeight} kg</p>
            </div>
            {targetWeight != null && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Meta</p>
                <p className="text-lg font-medium">{targetWeight} kg</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução do peso</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar peso/medidas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weight_kg">Peso (kg)</Label>
              <Input id="weight_kg" name="weight_kg" type="number" step="0.1" min="0" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="body_fat_pct">% Gordura</Label>
              <Input id="body_fat_pct" name="body_fat_pct" type="number" step="0.1" min="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="waist_cm">Cintura (cm)</Label>
              <Input id="waist_cm" name="waist_cm" type="number" step="0.1" min="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hip_cm">Quadril (cm)</Label>
              <Input id="hip_cm" name="hip_cm" type="number" step="0.1" min="0" />
            </div>
            <Button type="submit" className="col-span-2" disabled={saving}>
              Salvar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
