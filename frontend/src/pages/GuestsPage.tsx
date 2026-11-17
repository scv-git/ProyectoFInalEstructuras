import { useEffect, useState } from 'react'
import { Mail, Pencil, Plus, RefreshCw, Search, Trash2, Upload } from 'lucide-react'
import { createGuest, deleteGuest, getGuests, updateGuest } from '../api/resources'
import type { Guest } from '../types/domain'

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })
}

export function GuestsPage() {
  const [items, setItems] = useState<Guest[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showGuest, setShowGuest] = useState(false)
  const [editingDoc, setEditingDoc] = useState<string | null>(null)
  const [gDoc, setGDoc] = useState('')
  const [gNombre, setGNombre] = useState('')
  const [gFecha, setGFecha] = useState('')
  const [gTelefono, setGTelefono] = useState('')
  const [gCorreo, setGCorreo] = useState('')
  const [gFoto, setGFoto] = useState('')

  async function refresh(notify = false) {
    try {
      setItems(await getGuests())
      setError('')
      if (notify) setMessage('Huéspedes actualizados')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar huéspedes')
    }
  }
  useEffect(() => { void refresh() }, [])

  function resetForm() {
    setEditingDoc(null)
    setGDoc('')
    setGNombre('')
    setGFecha('')
    setGTelefono('')
    setGCorreo('')
    setGFoto('')
  }

  function openCreate() {
    resetForm()
    setShowGuest(true)
  }

  function openEdit(guest: Guest) {
    setEditingDoc(guest.documento)
    setGDoc(guest.documento)
    setGNombre(guest.nombre)
    setGFecha(guest.fechaNacimiento ?? '')
    setGTelefono(guest.telefono ?? '')
    setGCorreo(guest.correo ?? '')
    setGFoto(guest.foto ?? '')
    setShowGuest(true)
  }

  async function pickPhoto(file?: File) {
    if (!file) return
    if (file.size > 2_000_000) return setError('La imagen debe pesar menos de 2 MB.')
    try {
      setGFoto(await readImage(file))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer la imagen')
    }
  }

  async function handleSaveGuest() {
    if (!gDoc.trim() || !gNombre.trim()) return setError('Documento y nombre son obligatorios.')
    if (!gFecha) return setError('La fecha de nacimiento es obligatoria.')
    const data = {
      documento: gDoc.trim(),
      nombre: gNombre.trim(),
      fechaNacimiento: gFecha,
      telefono: gTelefono || '',
      correo: gCorreo || '',
      foto: gFoto,
    }
    try {
      if (editingDoc) await updateGuest(editingDoc, data)
      else await createGuest(data)
      setShowGuest(false)
      resetForm()
      await refresh()
      setError('')
      setMessage(editingDoc ? 'Huésped actualizado' : 'Huésped creado')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el huésped')
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
  const initials = (gNombre || gDoc || 'HU').slice(0, 2).toUpperCase()

  return (
    <section className="data-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Relación con huéspedes</span>
          <h1>Huéspedes</h1>
          <p>Personas, reservas e historial de estancias.</p>
        </div>
        <div className="page-intro__actions">
          <button className="button button--ghost" onClick={() => void refresh(true)}>
            <RefreshCw size={16} /> Actualizar
          </button>
          <button className="button button--primary button--compact" onClick={openCreate}>
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
                  <div className="guest-cell">
                    <span className="guest-thumb">
                      {g.foto ? <img src={g.foto} alt={g.nombre} /> : <span>{g.nombre.slice(0, 2).toUpperCase()}</span>}
                    </span>
                    <div>
                      <strong>{g.nombre}</strong>
                      <span>{g.documento}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="inline-icon"><Mail size={14} /> {g.correo || 'Sin correo'}</span>
                  <small>{g.telefono}</small>
                </td>
                <td>{g.fechaNacimiento || 'Sin fecha'}</td>
                <td>
                  <div className="row-actions">
                    <button title="Editar huésped" onClick={() => openEdit(g)}>
                      <Pencil size={15} />
                    </button>
                    <button title="Eliminar" onClick={() => void remove(g.documento)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
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
              <h3>{editingDoc ? 'Editar huésped' : 'Nuevo huésped'}</h3>
              <button className="modal-close" onClick={() => { setShowGuest(false); resetForm() }}>Cerrar</button>
            </div>
            <div className="profile-photo">
              {gFoto ? <img src={gFoto} alt="Foto del huésped" /> : <span>{initials}</span>}
            </div>
            <label className="form-label">Foto (opcional)</label>
            <label className="button button--ghost button--compact file-button">
              <Upload size={16} /> Elegir imagen
              <input type="file" accept="image/*" hidden onChange={(event) => void pickPhoto(event.target.files?.[0])} />
            </label>
            <label className="form-label">Documento</label>
            <input className="form-input" value={gDoc} onChange={(e) => setGDoc(e.target.value)} placeholder="Ej. 2003" disabled={!!editingDoc} />
            <label className="form-label">Nombre completo</label>
            <input className="form-input" value={gNombre} onChange={(e) => setGNombre(e.target.value)} placeholder="Ej. Ana Torres" />
            <label className="form-label">Fecha de nacimiento</label>
            <input className="form-input" type="date" value={gFecha} onChange={(e) => setGFecha(e.target.value)} />
            <label className="form-label">Teléfono</label>
            <input className="form-input" value={gTelefono} onChange={(e) => setGTelefono(e.target.value)} placeholder="Ej. 300 0000000" />
            <label className="form-label">Correo</label>
            <input className="form-input" value={gCorreo} onChange={(e) => setGCorreo(e.target.value)} placeholder="Ej. ana@correo.com" />
            <div className="form-actions">
              <button className="button button--ghost" onClick={() => { setShowGuest(false); resetForm() }}>Cancelar</button>
              <button className="button button--primary" onClick={() => void handleSaveGuest()}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
