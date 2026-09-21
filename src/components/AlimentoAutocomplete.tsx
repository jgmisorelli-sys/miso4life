import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import type { AlimentoRow } from '@/hooks/vida/useVidaAlimentosCatalogo'

interface AlimentoAutocompleteProps {
  alimentos: AlimentoRow[]
  onSelecionar: (alimento: AlimentoRow) => void
  placeholder?: string
}

/** Campo de busca com preenchimento automático -- todo lançamento parte de um alimento já cadastrado. */
export function AlimentoAutocomplete({ alimentos, onSelecionar, placeholder }: AlimentoAutocompleteProps) {
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
  const resultados = termo.length === 0 ? [] : alimentos.filter((a) => a.nome.toLowerCase().includes(termo)).slice(0, 8)

  function selecionar(alimento: AlimentoRow) {
    onSelecionar(alimento)
    setTexto(alimento.nome)
    setAberto(false)
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        placeholder={placeholder ?? 'Digite o alimento...'}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setAberto(true)
        }}
        onFocus={() => setAberto(true)}
        className="text-xs"
      />
      {aberto && resultados.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-card shadow-md">
          {resultados.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start px-3 py-2 text-left text-xs hover:bg-muted"
                onClick={() => selecionar(a)}
              >
                <span>{a.nome}</span>
                <span className="text-muted-foreground">
                  {a.porcao_label} · {a.kcal_por_porcao} kcal
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {aberto && termo.length > 0 && resultados.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card p-2 text-xs text-muted-foreground shadow-md">
          Nenhum alimento encontrado. Cadastre em Guia → Catálogo.
        </div>
      )}
    </div>
  )
}
