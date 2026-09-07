import { NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, Home, LineChart, User, Dumbbell, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/registro', label: 'Registrar', icon: Dumbbell, end: false },
  { to: '/planos', label: 'Planos', icon: ClipboardList, end: false },
  { to: '/progresso', label: 'Progresso', icon: LineChart, end: false },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
]

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col bg-muted/40 pb-24">
      <header className="flex items-center gap-2 bg-card px-4 py-4 shadow-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Leaf className="h-4 w-4" />
        </span>
        <h1 className="text-lg font-semibold text-primary">MISO4Life</h1>
      </header>

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-3xl gap-1 border-t border-border bg-card/95 px-2 py-2 backdrop-blur">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs text-muted-foreground transition-colors',
                isActive && 'bg-secondary font-medium text-primary',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
