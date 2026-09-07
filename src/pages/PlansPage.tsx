import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { parsePlanJson } from '@/lib/plan-parser'
import { useDietPlans, useWorkoutPlans } from '@/hooks/usePlans'
import type { DietImport, PlanImport, WorkoutImport } from '@/types/plan-import'

const TABS = ['Dietas', 'Treinos'] as const
type Tab = (typeof TABS)[number]

export function PlansPage() {
  const [tab, setTab] = useState<Tab>('Dietas')

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Meus Planos</h2>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm',
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Dietas' ? <DietPlansSection /> : <WorkoutPlansSection />}
    </div>
  )
}

function ImportBox({
  expectedType,
  onImport,
}: {
  expectedType: 'diet' | 'workout'
  onImport: (plan: PlanImport) => Promise<{ error: unknown } | undefined>
}) {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<PlanImport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleParse(raw: string) {
    setError(null)
    setPreview(null)
    if (!raw.trim()) return
    const result = parsePlanJson(raw)
    if (!result.ok) {
      setError(result.error)
      return
    }
    if (result.plan.type !== expectedType) {
      setError(`Este JSON é de "${result.plan.type}", mas aqui é a seção de "${expectedType}".`)
      return
    }
    setPreview(result.plan)
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const raw = await file.text()
    setText(raw)
    handleParse(raw)
  }

  async function handleConfirm() {
    if (!preview) return
    setImporting(true)
    const result = await onImport(preview)
    setImporting(false)
    if (result?.error) {
      setError('Erro ao importar: ' + String((result.error as Error)?.message ?? result.error))
      return
    }
    setText('')
    setPreview(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Importar {expectedType === 'diet' ? 'dieta' : 'treino'}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          placeholder='Cole aqui o JSON gerado no Claude chat, ex: { "type": "diet", ... }'
          rows={8}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            handleParse(e.target.value)
          }}
        />
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Enviar arquivo .json
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {preview && (
          <div className="rounded-md border border-border bg-muted p-3 text-sm">
            <p className="font-medium">{preview.name}</p>
            {preview.description && <p className="text-muted-foreground">{preview.description}</p>}
            <p className="mt-1 text-muted-foreground">
              {preview.type === 'diet'
                ? `${Object.values((preview as DietImport).days).flat().length} itens de refeição`
                : `${(preview as WorkoutImport).cycle.length} dia(s) de treino`}
            </p>
          </div>
        )}

        <Button type="button" disabled={!preview || importing} onClick={handleConfirm}>
          Confirmar importação
        </Button>
      </CardContent>
    </Card>
  )
}

function DietPlansSection() {
  const { plans, importDiet, setActiveDietPlan, deleteDietPlan } = useDietPlans()

  return (
    <div className="flex flex-col gap-4">
      <ImportBox
        expectedType="diet"
        onImport={(plan) => importDiet(plan as DietImport)}
      />

      <div className="flex flex-col gap-2">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium">
                  {plan.name} {plan.is_active && <span className="text-xs text-primary">(ativo)</span>}
                </p>
                {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
              </div>
              <div className="flex gap-2">
                {!plan.is_active && (
                  <Button size="sm" variant="outline" onClick={() => setActiveDietPlan(plan.id)}>
                    Ativar
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => deleteDietPlan(plan.id)}>
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {plans.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma dieta importada ainda.</p>}
      </div>
    </div>
  )
}

function WorkoutPlansSection() {
  const { plans, importWorkout, setActiveWorkoutPlan, deleteWorkoutPlan } = useWorkoutPlans()

  return (
    <div className="flex flex-col gap-4">
      <ImportBox
        expectedType="workout"
        onImport={(plan) => importWorkout(plan as WorkoutImport)}
      />

      <div className="flex flex-col gap-2">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium">
                  {plan.name} {plan.is_active && <span className="text-xs text-primary">(ativo)</span>}
                </p>
                {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
              </div>
              <div className="flex gap-2">
                {!plan.is_active && (
                  <Button size="sm" variant="outline" onClick={() => setActiveWorkoutPlan(plan.id)}>
                    Ativar
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => deleteWorkoutPlan(plan.id)}>
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {plans.length === 0 && <p className="text-sm text-muted-foreground">Nenhum treino importado ainda.</p>}
      </div>
    </div>
  )
}
