import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export function ProfilePage() {
  const { user } = useAuth()
  const { profile, updateProfile } = useProfile()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    target_weight_kg: '',
    daily_calorie_goal: '',
    daily_water_ml_goal: '',
    glass_size_ml: '',
    daily_coffee_limit: '',
  })

  useEffect(() => {
    if (!profile) return
    setForm({
      target_weight_kg: profile.target_weight_kg?.toString() ?? '',
      daily_calorie_goal: profile.daily_calorie_goal?.toString() ?? '',
      daily_water_ml_goal: profile.daily_water_ml_goal.toString(),
      glass_size_ml: profile.glass_size_ml.toString(),
      daily_coffee_limit: profile.daily_coffee_limit.toString(),
    })
  }, [profile])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    await updateProfile({
      target_weight_kg: form.target_weight_kg ? Number(form.target_weight_kg) : null,
      daily_calorie_goal: form.daily_calorie_goal ? Number(form.daily_calorie_goal) : null,
      daily_water_ml_goal: Number(form.daily_water_ml_goal) || 2500,
      glass_size_ml: Number(form.glass_size_ml) || 250,
      daily_coffee_limit: Number(form.daily_coffee_limit) || 3,
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Perfil e metas</h2>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => supabase.auth.signOut()}>
            Sair
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="target_weight_kg">Peso alvo (kg)</Label>
              <Input
                id="target_weight_kg"
                type="number"
                step="0.1"
                value={form.target_weight_kg}
                onChange={(e) => setForm({ ...form, target_weight_kg: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="daily_calorie_goal">Meta calórica (kcal)</Label>
              <Input
                id="daily_calorie_goal"
                type="number"
                value={form.daily_calorie_goal}
                onChange={(e) => setForm({ ...form, daily_calorie_goal: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="daily_water_ml_goal">Meta de água (ml)</Label>
              <Input
                id="daily_water_ml_goal"
                type="number"
                value={form.daily_water_ml_goal}
                onChange={(e) => setForm({ ...form, daily_water_ml_goal: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="glass_size_ml">Tamanho do copo (ml)</Label>
              <Input
                id="glass_size_ml"
                type="number"
                value={form.glass_size_ml}
                onChange={(e) => setForm({ ...form, glass_size_ml: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="daily_coffee_limit">Limite de café (xícaras)</Label>
              <Input
                id="daily_coffee_limit"
                type="number"
                value={form.daily_coffee_limit}
                onChange={(e) => setForm({ ...form, daily_coffee_limit: e.target.value })}
              />
            </div>
            <Button type="submit" className="col-span-2" disabled={saving}>
              Salvar metas
            </Button>
            {saved && <p className="col-span-2 text-sm text-muted-foreground">Salvo!</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
