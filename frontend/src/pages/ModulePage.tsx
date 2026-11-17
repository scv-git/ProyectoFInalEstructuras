import type { ViewKey } from '../layouts/AppLayout'
import { BarChart3, CalendarDays, ClipboardList, Database, Map, Sparkles, UsersRound } from 'lucide-react'

const content: Record<Exclude<ViewKey, 'inicio'>, { title: string; description: string; icon: typeof Map; action: string }> = {
  apartamentos: { title: 'Apartamentos', description: 'Inventario, estados, tarifas y capacidad del edificio.', icon: Map, action: 'Nuevo apartamento' },
  reservas: { title: 'Reservas', description: 'Disponibilidad, cotizaciones y movimientos de huéspedes en un solo recorrido.', icon: ClipboardList, action: 'Nueva reserva' },
  calendario: { title: 'Calendario de ocupación', description: 'Consulta las noches libres, ocupadas y bloqueadas por apartamento.', icon: CalendarDays, action: 'Cambiar periodo' },
  huespedes: { title: 'Huéspedes', description: 'Perfiles, favoritos, saldos e historial de estancias.', icon: UsersRound, action: 'Nuevo huésped' },
  preparacion: { title: 'Preparación', description: 'La cola priorizada para que cada apartamento vuelva a estar listo.', icon: Sparkles, action: 'Despachar siguiente' },
  mapa: { title: 'Mapa del edificio', description: 'Navegación por pasillos, nodos y rutas calculadas sobre el plano.', icon: Map, action: 'Calcular ruta' },
  estadisticas: { title: 'Estadísticas', description: 'Ocupación, ingresos, canales y tiempos operativos del periodo.', icon: BarChart3, action: 'Actualizar reporte' },
  administracion: { title: 'Administración', description: 'Carga escenarios, gestiona turnos, empleados y temporadas.', icon: Database, action: 'Cargar escenario' },
}

export function ModulePage({ view, onAction }: { view: Exclude<ViewKey, 'inicio'>; onAction?: () => void }) {
  const item = content[view]; const Icon = item.icon
  return <section className="module-page"><div className="module-hero"><div className="module-icon"><Icon size={26} /></div><span className="eyebrow">Área operativa</span><h1>{item.title}</h1><p>{item.description}</p><button className="button button--primary" onClick={onAction}>{item.action}</button></div><div className="module-empty"><div className="empty-grid" /><strong>Este espacio está listo para conectarse</strong><span>La estructura visual ya está preparada. El siguiente paso es enlazar sus acciones con los endpoints de Spring Boot.</span></div></section>
}
