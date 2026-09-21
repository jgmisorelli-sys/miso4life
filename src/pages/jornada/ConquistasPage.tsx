import { Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useVidaConquistas } from '@/hooks/vida/useVidaConquistas'

export function ConquistasPage() {
  const { conquistas, loading } = useVidaConquistas()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Conquistas</h2>

      {!loading && conquistas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum selo ainda — eles aparecem sozinhos conforme você avança.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {conquistas.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium">{c.nome}</p>
              <p className="text-xs text-muted-foreground">{c.data_conquista}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
