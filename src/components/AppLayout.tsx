import { NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, Home, LineChart, User, Dumbbell } from 'lucide-react'
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
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col pb-20">
      <header className="border-b border-border px-4 py-4">
        <h1 className="text-lg font-semibold text-primary">MISO4Life</h1>
      </header>

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-3xl border-t border-border bg-card">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground',
                isActive && 'text-primary',
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
