import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/jornada', label: 'Hoje', end: true },
  { to: '/jornada/semana', label: 'Semana', end: false },
  { to: '/jornada/sprint', label: 'Sprint', end: false },
  { to: '/jornada/progresso', label: 'Progresso', end: false },
  { to: '/jornada/recompensas', label: 'Recompensas', end: false },
  { to: '/jornada/conquistas', label: 'Conquistas', end: false },
  { to: '/jornada/guia', label: 'Guia', end: false },
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
