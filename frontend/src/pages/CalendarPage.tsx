import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { getCalendar } from '../api/resources'
import type { CalendarRow } from '../types/domain'

export function CalendarPage() {
  const now = new Date(); const [year, setYear] = useState(now.getFullYear()); const [month, setMonth] = useState(now.getMonth() + 1); const [rows, setRows] = useState<CalendarRow[]>([]); const [error, setError] = useState(''); const [message, setMessage] = useState('')
  async function refresh(notify = false) { try { setRows(await getCalendar(year, month)); setError(''); if (notify) setMessage('Calendario actualizado') } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar el calendario') } }
  useEffect(() => { void refresh() }, [year, month])
  function move(delta: number) { const date = new Date(year, month - 1 + delta, 1); setYear(date.getFullYear()); setMonth(date.getMonth() + 1) }
  const days = new Date(year, month, 0).getDate(); const label = new Date(year, month - 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  return <section className="data-page"><div className="page-intro"><div><span className="eyebrow">Disponibilidad nocturna</span><h1>Calendario</h1><p>Una lectura rápida del edificio durante el mes.</p></div><button className="button button--ghost" onClick={() => void refresh(true)}><RefreshCw size={16} /> Actualizar</button></div>{(error || message) && <div className={`notice ${error ? 'notice--warning' : ''}`}>{error || message}</div>}<div className="calendar-panel"><div className="calendar-head"><button className="icon-button" onClick={() => move(-1)} aria-label="Mes anterior"><ChevronLeft /></button><strong>{label}</strong><button className="icon-button" onClick={() => move(1)} aria-label="Mes siguiente"><ChevronRight /></button></div><div className="calendar-scroll"><table className="calendar-table"><thead><tr><th>Apartamento</th>{Array.from({ length: days }, (_, i) => <th key={i}>{i + 1}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.codigoApartamento}><th><strong>{row.codigoApartamento}</strong><span>{row.nombre}</span></th>{row.noches.map((night, index) => <td key={index} className={`night night--${night.toLowerCase()}`} title={`${night} · día ${index + 1}`} />)}</tr>)}</tbody></table></div><div className="calendar-legend"><span><i className="night--libre" /> Libre</span><span><i className="night--ocupada" /> Ocupada</span><span><i className="night--bloqueada" /> Bloqueada</span></div></div></section>
}
