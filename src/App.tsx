import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { QuickLogPage } from '@/pages/QuickLogPage'
import { PlansPage } from '@/pages/PlansPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { JornadaLayout } from '@/pages/jornada/JornadaLayout'
import { HojePage } from '@/pages/jornada/HojePage'
import { SemanaPage } from '@/pages/jornada/SemanaPage'
import { ProgressoPage } from '@/pages/jornada/ProgressoPage'
import { MedirPage } from '@/pages/jornada/MedirPage'
import { SprintPage } from '@/pages/jornada/SprintPage'
import { RecompensasPage } from '@/pages/jornada/RecompensasPage'
import { ConquistasPage } from '@/pages/jornada/ConquistasPage'
import { GuiaPratoPage } from '@/pages/jornada/GuiaPratoPage'

function ProtectedRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="registro" element={<QuickLogPage />} />
        <Route path="planos" element={<PlansPage />} />
        <Route path="progresso" element={<ProgressPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="jornada" element={<JornadaLayout />}>
          <Route index element={<HojePage />} />
          <Route path="semana" element={<SemanaPage />} />
          <Route path="progresso" element={<ProgressoPage />} />
          <Route path="medir" element={<MedirPage />} />
          <Route path="sprint" element={<SprintPage />} />
          <Route path="recompensas" element={<RecompensasPage />} />
          <Route path="conquistas" element={<ConquistasPage />} />
          <Route path="guia" element={<GuiaPratoPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return <ProtectedRoutes />
}
