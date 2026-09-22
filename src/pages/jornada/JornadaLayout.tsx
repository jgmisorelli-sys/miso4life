import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

// Hoje, Semana, Recompensas, Conquistas, Progresso, Guia e Metas já têm
// ícone próprio na barra principal (AppLayout) -- essa aba interna só
// cobre o que sobrou.
const TABS = [
  { to: '/jornada/sprint', label: 'Sprint', end: false },
  { to: '/jornada/medir', label: 'Medir', end: false },
]

export function JornadaLayout() {
  return (
    <div className="flex flex-col gap-4">
      <nav className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'shrink-0 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors',
                isActive ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
