import { useEffect, useState } from 'react'
import { Mail, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { createGuest, deleteGuest, getGuests } from '../api/resources'
import type { Guest } from '../types/domain'

export function GuestsPage() {
  const [items, setItems] = useState<Guest[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showGuest, setShowGuest] = useState(false)
  const [gDoc, setGDoc] = useState('')
  const [gNombre, setGNombre] = useState('')
  const [gFecha, setGFecha] = useState('')
  const [gTelefono, setGTelefono] = useState('')
  const [gCorreo, setGCorreo] = useState('')

  async function refresh() {
    try {
      setItems(await getGuests())
      setError('')
      setMessage('Huéspedes actualizados')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar huéspedes')
    }
  }
  useEffect(() => { void refresh() }, [])
  async function handleCreateGuest() {
    if (!gDoc.trim() || !gNombre.trim()) return setError('Documento y nombre son obligatorios.')
    try {
      await createGuest({
        documento: gDoc.trim(),
        nombre: gNombre.trim(),
        fechaNacimiento: gFecha || '',
        telefono: gTelefono || '',
        correo: gCorreo || '',
        foto: '',
      })
      setShowGuest(false)
      setGDoc('')
      setGNombre('')
      setGFecha('')
      setGTelefono('')
      setGCorreo('')
      await refresh()
      setMessage('Huésped creado')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el huésped')
    }
  }
  async function remove(documento: string) {
    if (!confirm('¿Eliminar este huésped?')) return
    try {
      await deleteGuest(documento)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar')
    }
  }
  const visible = items.filter((g) => `${g.documento} ${g.nombre} ${g.correo}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <section className="data-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Relación con huéspedes</span>
          <h1>Huéspedes</h1>
          <p>Personas, reservas e historial de estancias.</p>
        </div>
        <div className="page-intro__actions">
          <button className="button button--ghost" onClick={() => void refresh()}>
            <RefreshCw size={16} /> Actualizar
          </button>
          <button className="button button--primary button--compact" onClick={() => setShowGuest(true)}>
            <Plus size={16} /> Nuevo huésped
          </button>
        </div>
      </div>
      {(error || message) && <div className="notice">{error || message}</div>}
      <div className="toolbar">
        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por documento o nombre" />
        </label>
      </div>
      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Huésped</th>
              <th>Contacto</th>
              <th>Fecha de nacimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((g) => (
              <tr key={g.documento}>
                <td>
                  <strong>{g.nombre}</strong>
                  <span>{g.documento}</span>
                </td>
                <td>
                  <span className="inline-icon"><Mail size={14} /> {g.correo || 'Sin correo'}</span>
                  <small>{g.telefono}</small>
                </td>
                <td>{g.fechaNacimiento || 'Sin fecha'}</td>
                <td>
                  <button className="table-action" onClick={() => void remove(g.documento)}>
                    <Trash2 size={15} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">No hay huéspedes cargados.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showGuest && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <h3>Nuevo huésped</h3>
              <button className="modal-close" onClick={() => setShowGuest(false)}>Cerrar</button>
            </div>
            <label className="form-label">Documento</label>
            <input className="form-input" value={gDoc} onChange={(e) => setGDoc(e.target.value)} placeholder="Ej. 2003" />
            <label className="form-label">Nombre completo</label>
            <input className="form-input" value={gNombre} onChange={(e) => setGNombre(e.target.value)} placeholder="Ej. Ana Torres" />
            <label className="form-label">Fecha de nacimiento</label>
            <input className="form-input" type="date" value={gFecha} onChange={(e) => setGFecha(e.target.value)} />
            <label className="form-label">Teléfono</label>
            <input className="form-input" value={gTelefono} onChange={(e) => setGTelefono(e.target.value)} placeholder="Ej. 300 0000000" />
            <label className="form-label">Correo</label>
            <input className="form-input" value={gCorreo} onChange={(e) => setGCorreo(e.target.value)} placeholder="Ej. ana@correo.com" />
            <div className="form-actions">
              <button className="button button--ghost" onClick={() => setShowGuest(false)}>Cancelar</button>
              <button className="button button--primary" onClick={() => void handleCreateGuest()}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
