import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Search, Trash2, Wrench } from 'lucide-react'
import { createApartment, deleteApartment, getApartments, updateApartmentStatus } from '../api/resources'
import type { Apartment, ApartmentStatus } from '../types/domain'
import { StatusPill } from '../components/StatusPill'

export function ApartmentsPage() {
  const [items, setItems] = useState<Apartment[]>([])
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newName, setNewName] = useState('')
  const [newBlock, setNewBlock] = useState('A')
  const [newFloor, setNewFloor] = useState('1')
  const [newRooms, setNewRooms] = useState('1')
  const [newCap, setNewCap] = useState('2')
  const [showMotivo, setShowMotivo] = useState(false)
  const [motivoCode, setMotivoCode] = useState('')
  const [motivoText, setMotivoText] = useState('')

  async function refresh(notify = false) {
    try {
      setItems(await getApartments(order))
      setError('')
      if (notify) setMessage('Apartamentos actualizados')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar apartamentos')
    }
  }
  useEffect(() => { void refresh() }, [order])
  const visible = items.filter((a) => `${a.codigo} ${a.nombre} ${a.bloque}`.toLowerCase().includes(query.toLowerCase()))

  async function handleOutOfService(code: string) {
    setMotivoCode(code)
    setMotivoText('')
    setShowMotivo(true)
  }
  async function saveOutOfService() {
    if (!motivoText.trim()) return setError('Debes registrar un motivo para poner el apartamento fuera de servicio.')
    try {
      await updateApartmentStatus(motivoCode, { estado: 'FUERA_DE_SERVICIO', motivo: motivoText.trim() })
      setShowMotivo(false)
      await refresh()
      setMessage(`Estado de ${motivoCode} actualizado`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar')
    }
  }
  async function remove(code: string) {
    if (!confirm(`¿Eliminar ${code}?`)) return
    try {
      await deleteApartment(code)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar')
    }
  }
  async function handleCreateApartment() {
    if (!newCode.trim() || !newName.trim()) return setError('Código y nombre son obligatorios.')
    try {
      await createApartment({
        codigo: newCode.trim(),
        nombre: newName.trim(),
        bloque: newBlock,
        piso: Number(newFloor) || 1,
        dormitorios: Number(newRooms) || 1,
        capacidad: Number(newCap) || 2,
        caracteristicas: '',
        tarifaBaja: 0,
        tarifaMedia: 0,
        tarifaAlta: 0,
      })
      setShowAdd(false)
      setNewCode('')
      setNewName('')
      setNewBlock('A')
      setNewFloor('1')
      setNewRooms('1')
      setNewCap('2')
      await refresh()
      setMessage('Apartamento creado')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear')
    }
  }

  return (
    <section className="data-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Catálogo operativo</span>
          <h1>Apartamentos</h1>
          <p>Inventario, estados y capacidad del edificio.</p>
        </div>
        <div className="page-intro__actions">
          <button className="button button--ghost" onClick={() => void refresh()}>
            <RefreshCw size={16} /> Actualizar
          </button>
          <button className="button button--primary button--compact" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Nuevo apartamento
          </button>
        </div>
      </div>
      {(error || message) && (
        <div className={`notice ${error ? 'notice--warning' : ''}`}>
          <span>{error || message}</span>
        </div>
      )}
      <div className="toolbar">
        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar código, nombre o bloque" />
        </label>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="">Orden original</option>
          <option value="precio">Precio</option>
          <option value="capacidad">Capacidad</option>
          <option value="dormitorios">Dormitorios</option>
          <option value="reservas">Reservas</option>
        </select>
      </div>
      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Apartamento</th>
              <th>Ubicación</th>
              <th>Capacidad</th>
              <th>Estado y motivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.codigo}>
                <td>
                  <strong>{a.codigo}</strong>
                  <span>{a.nombre}</span>
                </td>
                <td>Bloque {a.bloque}, piso {a.piso}</td>
                <td>{a.dormitorios} hab. · {a.capacidad} personas</td>
                <td>
                  <StatusPill status={a.estado} />
                  {a.estado === 'FUERA_DE_SERVICIO' && a.motivoFueraServicio && (
                    <small className="table-reason">Motivo: {a.motivoFueraServicio}</small>
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <button title="Marcar fuera de servicio" onClick={() => void handleOutOfService(a.codigo)}>
                      <Wrench size={15} />
                    </button>
                    <button title="Eliminar" onClick={() => void remove(a.codigo)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">No hay apartamentos para mostrar.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <h3>Nuevo apartamento</h3>
              <button className="modal-close" onClick={() => setShowAdd(false)}>Cerrar</button>
            </div>
            <label className="form-label">Código</label>
            <input className="form-input" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Ej. A101" />
            <label className="form-label">Nombre</label>
            <input className="form-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej. Apartamento A101" />
            <label className="form-label">Bloque</label>
            <input className="form-input" value={newBlock} onChange={(e) => setNewBlock(e.target.value)} placeholder="A" />
            <label className="form-label">Piso</label>
            <input className="form-input" type="number" value={newFloor} onChange={(e) => setNewFloor(e.target.value)} placeholder="1" />
            <label className="form-label">Dormitorios</label>
            <input className="form-input" type="number" value={newRooms} onChange={(e) => setNewRooms(e.target.value)} placeholder="1" />
            <label className="form-label">Capacidad (personas)</label>
            <input className="form-input" type="number" value={newCap} onChange={(e) => setNewCap(e.target.value)} placeholder="2" />
            <div className="form-actions">
              <button className="button button--ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="button button--primary" onClick={() => void handleCreateApartment()}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showMotivo && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <h3>Fuera de servicio: {motivoCode}</h3>
              <button className="modal-close" onClick={() => setShowMotivo(false)}>Cerrar</button>
            </div>
            <label className="form-label">Motivo</label>
            <input className="form-input" value={motivoText} onChange={(e) => setMotivoText(e.target.value)} placeholder="Ej. Daños en instalaciones" />
            <div className="form-actions">
              <button className="button button--ghost" onClick={() => setShowMotivo(false)}>Cancelar</button>
              <button className="button button--primary" onClick={() => void saveOutOfService()}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
