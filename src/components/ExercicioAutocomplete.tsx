import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import type { ExercicioRow } from '@/hooks/vida/useVidaExerciciosCatalogo'

interface ExercicioAutocompleteProps {
  exercicios: ExercicioRow[]
  onSelecionar: (exercicio: ExercicioRow) => void
  placeholder?: string
  className?: string
}

/** Campo de busca com preenchimento automático a partir do catálogo de exercícios já cadastrados. */
export function ExercicioAutocomplete({ exercicios, onSelecionar, placeholder, className }: ExercicioAutocompleteProps) {
  const [texto, setTexto] = useState('')
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fecharAoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

  const termo = texto.trim().toLowerCase()
  const resultados =
    termo.length === 0 ? [] : exercicios.filter((e) => e.nome.toLowerCase().includes(termo)).slice(0, 8)

  function selecionar(exercicio: ExercicioRow) {
    onSelecionar(exercicio)
    setTexto(exercicio.nome)
    setAberto(false)
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        placeholder={placeholder ?? 'Digite o exercício...'}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setAberto(true)
        }}
        onFocus={() => setAberto(true)}
        className={className}
      />
      {aberto && resultados.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-card shadow-md">
          {resultados.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start px-3 py-2 text-left text-xs hover:bg-muted"
                onClick={() => selecionar(e)}
              >
                <span>{e.nome}</span>
                <span className="text-muted-foreground">
                  {e.kcal_estimado} kcal{e.duracao_min_estimado ? ` · ${e.duracao_min_estimado} min` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {aberto && termo.length > 0 && resultados.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card p-2 text-xs text-muted-foreground shadow-md">
          Nenhum exercício encontrado. Cadastre em Guia → Catálogo de exercícios.
        </div>
      )}
    </div>
  )
}
