import { useEffect, useState } from 'react'
import { ArrowRight, BedDouble, Building2, Database, LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react'
import { getApartments, getMap, loadScenario } from '../api/resources'
import type { Apartment, MapData } from '../types/domain'
import { ApartmentCard } from '../components/ApartmentCard'
import { MapPreview } from '../components/MapPreview'
import type { ViewKey } from '../layouts/AppLayout'
import type { Role } from '../auth/users'

export function OverviewPage({ onNavigate, role }: { onNavigate: (view: ViewKey) => void; role: Role }) {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [map, setMap] = useState<MapData>()
  const [loading, setLoading] = useState(true)
  const [loadingScenario, setLoadingScenario] = useState(false)
  const [error, setError] = useState('')
  const isGuest = role === 'HUESPED'

  async function loadData() {
    setLoading(true); setError('')
    try {
      const [apartmentsData, mapData] = await Promise.all([getApartments(), isGuest ? Promise.resolve(undefined) : getMap()])
      setApartments(apartmentsData)
      setMap(mapData)
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo conectar con la API.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void loadData() }, [])

  async function handleLoadScenario() {
    setLoadingScenario(true)
    setError('')
    try {
      await loadScenario()
      await loadData()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar el escenario.')
    } finally {
      setLoadingScenario(false)
    }
  }

  const counts = apartments.reduce<Record<string, number>>((acc, apartment) => { const state = apartment.estado ?? 'PREPARADO'; acc[state] = (acc[state] ?? 0) + 1; return acc }, {})
  const displayed = isGuest ? apartments.filter((apartment) => (apartment.estado ?? 'PREPARADO') === 'PREPARADO') : apartments
  const fechaActual = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const eyebrow = fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1)

  return <>
    <section className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{isGuest ? <>Tu próxima <em>estancia.</em></> : <>El edificio, <em>en movimiento.</em></>}</h1><p>{isGuest ? 'Apartamentos listos para recibirte en Aparta-Suites UQ.' : 'Una vista clara de lo que está pasando en Aparta-Suites UQ.'}</p></div><div className="page-intro__actions"><button className="button button--ghost" onClick={() => void loadData()}><RefreshCw size={16} /> Actualizar</button>{!isGuest && <button className="button button--primary button--compact" onClick={() => void handleLoadScenario()} disabled={loadingScenario}>{loadingScenario ? <LoaderCircle className="spin" size={16} /> : <Database size={16} />} {loadingScenario ? 'Cargando...' : 'Cargar escenario'}</button>}</div></section>
    {error && <div className="notice notice--warning"><TriangleAlert size={18} /><div><strong>No hay datos cargados</strong><span>{error} Verifica que Spring Boot esté ejecutándose en el puerto 8080 y carga el escenario inicial.</span></div></div>}
    <section className="metric-row metric-row--guest">
      <div className="metric-card metric-card--dark"><div className="metric-icon"><Building2 size={19} /></div><span>Total de apartamentos</span><strong>{loading ? '—' : apartments.length || 0}</strong><small>en el inventario</small></div>
      <div className="metric-card"><div className="metric-card__label"><span className="signal signal--green" /> Listos para recibir</div><strong>{counts.PREPARADO ?? 0}</strong><small>apartamentos preparados</small></div>
      {!isGuest && <>
        <div className="metric-card"><div className="metric-card__label"><span className="signal signal--blue" /> Actualmente ocupados</div><strong>{counts.OCUPADO ?? 0}</strong><small>huéspedes dentro</small></div>
        <div className="metric-card"><div className="metric-card__label"><span className="signal signal--amber" /> Requieren atención</div><strong>{(counts.PENDIENTE_PREPARACION ?? 0) + (counts.EN_PREPARACION ?? 0)}</strong><small>en la cola operativa</small></div>
      </>}
    </section>
    <section className={isGuest ? 'workspace-grid workspace-grid--guest' : 'workspace-grid'}>
      <div className="panel apartment-panel">
        <div className="panel-heading"><div><span className="section-kicker">{isGuest ? 'Disponibles para ti' : 'Inventario en vivo'}</span><h2>{isGuest ? 'Apartamentos listos para recibir' : 'Estado de los apartamentos'}</h2></div><button className="text-button" onClick={() => onNavigate('calendario')}>Ver calendario <ArrowRight size={15} /></button></div>
        {loading ? <div className="loading-state"><LoaderCircle className="spin" size={24} /> Consultando apartamentos...</div> : displayed.length ? <div className="apartment-grid">{displayed.map((apartment) => <ApartmentCard key={apartment.codigo} apartment={apartment} />)}</div> : <div className="empty-state"><BedDouble size={24} /><strong>No hay apartamentos listos por ahora</strong><span>Vuelve a consultar más tarde o revisa el calendario de disponibilidad.</span></div>}
      </div>
      {!isGuest && <div className="panel map-panel"><div className="panel-heading"><div><span className="section-kicker">Orientación</span><h2>Plano operativo</h2></div><button className="icon-button" onClick={() => onNavigate('mapa')} aria-label="Abrir mapa"><ArrowRight size={17} /></button></div><MapPreview data={map} /></div>}
    </section>
  </>
}
