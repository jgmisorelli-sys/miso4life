import { useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAddButtonProps {
  icon: ReactNode
  label: string
  color: 'water' | 'coffee'
  onAdd: () => Promise<unknown> | void
}

const COLOR_CLASSES: Record<QuickAddButtonProps['color'], { bg: string; text: string }> = {
  water: { bg: 'bg-water-soft', text: 'text-water' },
  coffee: { bg: 'bg-coffee-soft', text: 'text-coffee' },
}

export function QuickAddButton({ icon, label, color, onAdd }: QuickAddButtonProps) {
  const [state, setState] = useState<'idle' | 'pending' | 'done'>('idle')
  const { bg, text } = COLOR_CLASSES[color]

  async function handleClick() {
    if (state === 'pending') return
    setState('pending')
    await onAdd()
    setState('done')
    setTimeout(() => setState('idle'), 700)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
    >
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
          bg,
          text,
        )}
      >
        {state === 'done' ? <Check className="h-6 w-6" /> : icon}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  )
}
