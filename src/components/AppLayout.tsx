import { NavLink, Outlet } from 'react-router-dom'
import {
  Award,
  BookOpen,
  CalendarDays,
  Dumbbell,
  Gift,
  Home,
  LineChart,
  Leaf,
  Target,
  Trophy,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Navegação achatada e rolável: as seções da Jornada ganham ícone próprio
// na barra principal em vez de ficarem escondidas atrás de um único item
// "Jornada". Recompensas e Conquistas vêm logo no início -- são o que
// mais motiva o uso diário.
const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/jornada', label: 'Hoje', icon: Trophy, end: true },
  { to: '/jornada/recompensas', label: 'Recompensas', icon: Gift, end: false },
  { to: '/jornada/conquistas', label: 'Conquistas', icon: Award, end: false },
  { to: '/jornada/semana', label: 'Semana', icon: CalendarDays, end: false },
  { to: '/registro', label: 'Registrar', icon: Dumbbell, end: false },
  { to: '/jornada/progresso', label: 'Progresso', icon: LineChart, end: false },
  { to: '/jornada/guia', label: 'Guia', icon: BookOpen, end: false },
  { to: '/jornada/configuracoes', label: 'Metas', icon: Target, end: false },
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

      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-3xl gap-1 overflow-x-auto border-t border-border bg-card/95 px-2 py-2 backdrop-blur">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl py-2 text-xs text-muted-foreground transition-colors',
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
