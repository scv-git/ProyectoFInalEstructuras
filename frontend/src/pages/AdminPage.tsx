import { useEffect, useState } from 'react'
import { Database, Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'
import { createEmployee, createSeason, deleteEmployee, deleteSeason, getCurrentShift, getEmployees, getSeasons, loadScenario, rotateShift } from '../api/resources'

export function AdminPage() {
  const [employees, setEmployees] = useState<unknown[]>([])
  const [seasons, setSeasons] = useState<unknown[]>([])
  const [shift, setShift] = useState<unknown>()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [showEmp, setShowEmp] = useState(false)
  const [empDoc, setEmpDoc] = useState('')
  const [empNombre, setEmpNombre] = useState('')
  const [empRol, setEmpRol] = useState<'RECEPCIONISTA' | 'PREPARACION' | 'ADMINISTRADOR'>('RECEPCIONISTA')

  const [showSeason, setShowSeason] = useState(false)
  const [tempTemporada, setTempTemporada] = useState<'BAJA' | 'MEDIA' | 'ALTA'>('BAJA')
  const [tempInicio, setTempInicio] = useState('')
  const [tempFin, setTempFin] = useState('')

  async function refresh(notify = false) {
    try {
      const [staff, periods, current] = await Promise.all([getEmployees(), getSeasons(), getCurrentShift()])
      setEmployees(staff)
      setSeasons(periods)
      setShift(current)
      setError('')
      if (notify) setMessage('Administración actualizada')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar administración')
    }
  }
  useEffect(() => { void refresh() }, [])
  async function scenario() {
    try {
      const result = await loadScenario()
      setMessage(result.mensaje)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar escenario')
    }
  }
  async function saveEmployee() {
    if (!empDoc.trim() || !empNombre.trim()) return setError('Documento y nombre son obligatorios.')
    try {
      await createEmployee({ documento: empDoc.trim(), nombre: empNombre.trim(), rol: empRol })
      setShowEmp(false)
      setEmpDoc('')
      setEmpNombre('')
      setEmpRol('RECEPCIONISTA')
      await refresh()
      setMessage('Empleado creado')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear empleado')
    }
  }
  async function saveSeason() {
    if (!tempInicio || !tempFin) return setError('Ingresa fechas de inicio y fin.')
    try {
      await createSeason({ temporada: tempTemporada, inicio: tempInicio, fin: tempFin })
      setShowSeason(false)
      setTempTemporada('BAJA')
      setTempInicio('')
      setTempFin('')
      await refresh()
      setMessage('Temporada creada')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear temporada')
    }
  }
  async function deleteEmployeeRow(documento: string) {
    if (!confirm(`¿Eliminar empleado ${documento}?`)) return
    try {
      await deleteEmployee(documento)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar empleado')
    }
  }
  async function deleteSeasonRow(index: number) {
    if (!confirm('¿Eliminar temporada?')) return
    try {
      await deleteSeason(index)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar temporada')
    }
  }

  return (
    <section className="data-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Control del sistema</span>
          <h1>Administración</h1>
          <p>Carga escenarios y organiza los recursos que sostienen la operación.</p>
        </div>
        <button className="button button--ghost" onClick={() => void refresh(true)}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>
      {(error || message) && (
        <div className="notice">{error || message}</div>
      )}
      <div className="admin-grid">
        <div className="panel admin-card">
          <Database size={22} />
          <h2>Escenario inicial</h2>
          <p>Importa apartamentos, pasillos, huéspedes y reservas de prueba.</p>
          <button className="button button--primary button--compact" onClick={() => void scenario()}>
            Cargar datos
          </button>
        </div>
        <div className="panel admin-card">
          <RotateCcw size={22} />
          <h2>Turno actual</h2>
          <p>{JSON.stringify(shift) || 'Sin turno cargado'}</p>
          <button className="button button--ghost button--compact" onClick={() => void rotateShift().then(() => refresh(true))}>
            Rotar turno
          </button>
        </div>
      </div>
      <div className="admin-grid">
        <div className="panel list-panel">
          <div className="panel-heading">
            <h2>Empleados ({employees.length})</h2>
            <button className="text-button" onClick={() => setShowEmp(true)}>
              <Plus size={15} /> Agregar
            </button>
          </div>
          {employees.map((item, index) => (
            <div className="admin-list-item" key={index}>
              <span>{JSON.stringify(item)}</span>
              <button onClick={() => void deleteEmployeeRow(String((item as { documento?: string }).documento)).then(() => refresh(true))}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <div className="panel list-panel">
          <div className="panel-heading">
            <h2>Temporadas ({seasons.length})</h2>
            <button className="text-button" onClick={() => setShowSeason(true)}>
              <Plus size={15} /> Agregar
            </button>
          </div>
          {seasons.map((item, index) => (
            <div className="admin-list-item" key={index}>
              <span>{JSON.stringify(item)}</span>
              <button onClick={() => void deleteSeasonRow(index).then(() => refresh(true))}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showEmp && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <h3>Agregar empleado</h3>
              <button className="modal-close" onClick={() => setShowEmp(false)}>Cerrar</button>
            </div>
            <label className="form-label">Documento</label>
            <input className="form-input" value={empDoc} onChange={(e) => setEmpDoc(e.target.value)} placeholder="Ej. 2003" />
            <label className="form-label">Nombre</label>
            <input className="form-input" value={empNombre} onChange={(e) => setEmpNombre(e.target.value)} placeholder="Ej. María Gómez" />
            <label className="form-label">Rol</label>
            <select className="form-input" value={empRol} onChange={(e) => setEmpRol(e.target.value as 'RECEPCIONISTA' | 'PREPARACION' | 'ADMINISTRADOR')}>
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="PREPARACION">Preparación</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
            <div className="form-actions">
              <button className="button button--ghost" onClick={() => setShowEmp(false)}>Cancelar</button>
              <button className="button button--primary" onClick={() => void saveEmployee()}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showSeason && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <h3>Agregar temporada</h3>
              <button className="modal-close" onClick={() => setShowSeason(false)}>Cerrar</button>
            </div>
            <label className="form-label">Temporada</label>
            <select className="form-input" value={tempTemporada} onChange={(e) => setTempTemporada(e.target.value as 'BAJA' | 'MEDIA' | 'ALTA')}>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>
            <label className="form-label">Inicio (AAAA-MM-DD)</label>
            <input className="form-input" type="date" value={tempInicio} onChange={(e) => setTempInicio(e.target.value)} />
            <label className="form-label">Fin (AAAA-MM-DD)</label>
            <input className="form-input" type="date" value={tempFin} onChange={(e) => setTempFin(e.target.value)} />
            <div className="form-actions">
              <button className="button button--ghost" onClick={() => setShowSeason(false)}>Cancelar</button>
              <button className="button button--primary" onClick={() => void saveSeason()}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
