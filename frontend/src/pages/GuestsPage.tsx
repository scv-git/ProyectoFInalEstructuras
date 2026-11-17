import { useEffect, useState } from 'react'
import { Mail, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { createGuest, deleteGuest, getGuests } from '../api/resources'
import type { Guest } from '../types/domain'

export function GuestsPage() {
  const [items, setItems] = useState<Guest[]>([]); const [query, setQuery] = useState(''); const [error, setError] = useState('')
  async function refresh() { try { setItems(await getGuests()); setError('') } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar huéspedes') } }
  useEffect(() => { void refresh() }, [])
  async function add() { const documento = prompt('Documento'); if (!documento) return; const nombre = prompt('Nombre completo'); if (!nombre) return; try { await createGuest({ documento, nombre, fechaNacimiento: '1990-01-01', telefono: '', correo: '', foto: '' }); await refresh() } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo crear el huésped') } }
  async function remove(documento: string) { if (!confirm('¿Eliminar este huésped?')) return; try { await deleteGuest(documento); await refresh() } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar') } }
  const visible = items.filter((g) => `${g.documento} ${g.nombre} ${g.correo}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="data-page"><div className="page-intro"><div><span className="eyebrow">Relación con huéspedes</span><h1>Huéspedes</h1><p>Personas, reservas e historial de estancias.</p></div><div className="page-intro__actions"><button className="button button--ghost" onClick={() => void refresh()}><RefreshCw size={16} /> Actualizar</button><button className="button button--primary button--compact" onClick={() => void add()}><Plus size={16} /> Nuevo huésped</button></div></div>{error && <div className="notice notice--warning">{error}</div>}<div className="toolbar"><label className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por documento o nombre" /></label></div><div className="table-panel"><table><thead><tr><th>Huésped</th><th>Contacto</th><th>Fecha de nacimiento</th><th>Acciones</th></tr></thead><tbody>{visible.map((g) => <tr key={g.documento}><td><strong>{g.nombre}</strong><span>{g.documento}</span></td><td><span className="inline-icon"><Mail size={14} /> {g.correo || 'Sin correo'}</span><small>{g.telefono}</small></td><td>{g.fechaNacimiento || 'Sin fecha'}</td><td><button className="table-action" onClick={() => void remove(g.documento)}><Trash2 size={15} /> Eliminar</button></td></tr>)}{!visible.length && <tr><td colSpan={4}><div className="empty-state">No hay huéspedes cargados.</div></td></tr>}</tbody></table></div></section>
}
