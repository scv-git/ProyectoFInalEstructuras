import { useEffect, useState, type ReactNode } from 'react'
import { BarChart3, ArrowLeft, Building2, CalendarDays, ClipboardList, Home, Map, Menu, PanelLeftClose, Settings2, Sparkles, UsersRound, X } from 'lucide-react'
import { roleLabels, type Role, type SessionUser } from '../auth/users'
import { getPreparationQueue } from '../api/resources'

export type ViewKey = 'inicio' | 'apartamentos' | 'reservas' | 'calendario' | 'huespedes' | 'preparacion' | 'mapa' | 'estadisticas' | 'administracion'

const navigation: Array<{ key: ViewKey; label: string; icon: typeof Home }> = [
  { key: 'inicio', label: 'Inicio', icon: Home },
  { key: 'apartamentos', label: 'Apartamentos', icon: Building2 },
  { key: 'reservas', label: 'Reservas', icon: ClipboardList },
  { key: 'calendario', label: 'Calendario', icon: CalendarDays },
  { key: 'huespedes', label: 'Huéspedes', icon: UsersRound },
  { key: 'preparacion', label: 'Preparación', icon: Sparkles },
  { key: 'mapa', label: 'Mapa del edificio', icon: Map },
  { key: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { key: 'administracion', label: 'Administración', icon: Settings2 },
]

const access: Record<Role, ViewKey[]> = {
  HUESPED: ['inicio', 'reservas', 'calendario', 'mapa', 'huespedes'],
  RECEPCIONISTA: ['inicio', 'apartamentos', 'reservas', 'calendario', 'huespedes', 'preparacion', 'mapa'],
  ADMINISTRADOR: ['inicio', 'apartamentos', 'reservas', 'calendario', 'huespedes', 'preparacion', 'mapa', 'estadisticas', 'administracion'],
}

export function AppLayout({ activeView, user, onNavigate, onBack, onLogout, children }: { activeView: ViewKey; user: SessionUser; onNavigate: (view: ViewKey) => void; onBack: () => void; onLogout: () => void; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [prepCount, setPrepCount] = useState(0)
  const visibleNavigation = navigation.filter((item) => access[user.role].includes(item.key))
  const currentLabel = visibleNavigation.find((item) => item.key === activeView)?.label

  useEffect(() => {
    const load = () => getPreparationQueue().then((items) => setPrepCount(Array.isArray(items) ? items.length : 0)).catch(() => setPrepCount(0))
    let timer: ReturnType<typeof setInterval> | undefined
    if (activeView === 'preparacion') {
      load()
      timer = setInterval(load, 3000)
    } else {
      setPrepCount(0)
    }
    return () => { if (timer) clearInterval(timer) }
  }, [activeView])

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="brand"><div className="brand-mark">AU</div><div><strong>Aparta-Suites UQ</strong><span>operaciones</span></div><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><X size={20} /></button></div>
        <nav aria-label="Navegación principal">
          <span className="nav-heading">Espacios de trabajo</span>
          {visibleNavigation.map(({ key, label, icon: Icon }) => <button key={key} className={`nav-item ${activeView === key ? 'nav-item--active' : ''}`} onClick={() => { onNavigate(key); setMobileOpen(false) }}><Icon size={18} /><span>{label}</span>{key === 'preparacion' && prepCount > 0 && <b>{prepCount}</b>}</button>)}
        </nav>
        <div className="sidebar-footer"><div className="connection-dot"><span /> API · puerto 8080</div><div className="session-user"><strong>{user.nombre}</strong><span>{roleLabels[user.role]}</span></div><button className="collapse-button" onClick={onLogout}><PanelLeftClose size={17} /> Cerrar sesión</button></div>
      </aside>
      {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}
      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button>{activeView !== 'inicio' && <button className="icon-button topbar-back" onClick={onBack} aria-label="Volver a la pantalla anterior" title="Volver"><ArrowLeft size={19} /></button>}<div><span className="breadcrumb">Aparta-Suites UQ /</span><strong>{currentLabel}</strong></div><div className="topbar-actions"><span className="shift-label">{roleLabels[user.role]}</span><div className="avatar">{user.nombre.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div></div></header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}
