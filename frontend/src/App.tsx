import { useState } from 'react'
import { AppLayout, type ViewKey } from './layouts/AppLayout'
import { LoginPage } from './auth/LoginPage'
import type { SessionUser } from './auth/users'
import { OverviewPage } from './pages/OverviewPage'
import { ApartmentsPage } from './pages/ApartmentsPage'
import { ReservationsPage } from './pages/ReservationsPage'
import { CalendarPage } from './pages/CalendarPage'
import { GuestsPage } from './pages/GuestsPage'
import { PreparationPage } from './pages/PreparationPage'
import { MapPage } from './pages/MapPage'
import { StatsPage } from './pages/StatsPage'
import { AdminPage } from './pages/AdminPage'
import { GuestPage } from './pages/GuestPage'

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(() => {
    const saved = sessionStorage.getItem('sga-session')
    return saved ? JSON.parse(saved) as SessionUser : null
  })
  const [view, setView] = useState<ViewKey>('inicio')
  if (!user) return <LoginPage onLogin={(nextUser) => { sessionStorage.setItem('sga-session', JSON.stringify(nextUser)); setUser(nextUser) }} />
  function logout() { sessionStorage.removeItem('sga-session'); setUser(null); setView('inicio') }
  const content = {
    inicio: <OverviewPage onNavigate={setView} role={user.role} />,
    apartamentos: <ApartmentsPage />,
    reservas: user.role === 'HUESPED' ? <GuestPage user={user} /> : <ReservationsPage />,
    calendario: <CalendarPage />,
    huespedes: user.role === 'HUESPED' ? <GuestPage user={user} /> : <GuestsPage />,
    preparacion: <PreparationPage />,
    mapa: <MapPage />,
    estadisticas: <StatsPage />,
    administracion: <AdminPage />,
  }[view]
  return <AppLayout activeView={view} user={user} onNavigate={setView} onLogout={logout}>{content}</AppLayout>
}
