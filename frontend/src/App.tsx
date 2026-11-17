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
import { backScreen, goToScreen } from './api/resources'

const screenByView: Record<ViewKey, string> = {
  inicio: 'INICIO',
  apartamentos: 'APARTAMENTOS',
  reservas: 'RESERVAS',
  calendario: 'CALENDARIO',
  huespedes: 'HUESPEDES',
  preparacion: 'PREPARACION',
  mapa: 'MAPA',
  estadisticas: 'ESTADISTICAS',
  administracion: 'ADMINISTRACION',
}

const viewByScreen = Object.fromEntries(Object.entries(screenByView).map(([view, screen]) => [screen, view])) as Record<string, ViewKey>

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(() => {
    const saved = sessionStorage.getItem('sga-session')
    return saved ? JSON.parse(saved) as SessionUser : null
  })
  const [view, setView] = useState<ViewKey>('inicio')
  function navigate(next: ViewKey) {
    if (next === view) return
    setView(next)
    goToScreen(screenByView[next]).catch(() => undefined)
  }
  async function goBack() {
    try {
      const previous = await backScreen()
      const target = viewByScreen[previous.pantalla]
      setView(target ?? 'inicio')
    } catch {
      setView('inicio')
    }
  }
  if (!user) return <LoginPage onLogin={(nextUser) => { sessionStorage.setItem('sga-session', JSON.stringify(nextUser)); setUser(nextUser); goToScreen('INICIO').catch(() => undefined) }} />
  function logout() { sessionStorage.removeItem('sga-session'); setUser(null); setView('inicio') }
  const content = {
    inicio: <OverviewPage onNavigate={navigate} role={user.role} />,
    apartamentos: <ApartmentsPage />,
    reservas: user.role === 'HUESPED' ? <GuestPage user={user} /> : <ReservationsPage />,
    calendario: <CalendarPage />,
    huespedes: user.role === 'HUESPED' ? <GuestPage user={user} /> : <GuestsPage />,
    preparacion: <PreparationPage />,
    mapa: <MapPage />,
    estadisticas: <StatsPage />,
    administracion: <AdminPage />,
  }[view]
  return <AppLayout activeView={view} user={user} onNavigate={navigate} onBack={goBack} onLogout={logout}>{content}</AppLayout>
}
