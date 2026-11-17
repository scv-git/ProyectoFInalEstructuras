import { useEffect, useState } from 'react'
import {
  CalendarPlus,
  Check,
  LogIn,
  LogOut,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Trash2,
  TriangleAlert,
  UserX,
  X,
} from 'lucide-react'
import {
  createReservation,
  getApartments,
  getAvailability,
  getRefund,
  getReservations,
  loadScenario,
  processExpirations,
  quoteReservation,
  reservationAction,
} from '../api/resources'
import type { Apartment, Occupant, Quote, Reservation } from '../types/domain'
import { ExternalChannelPanel } from '../components/ExternalChannelPanel'
import { FolioPanel } from '../components/FolioPanel'
import { GroupPlanner } from '../components/GroupPlanner'
import { QuoteSummary } from '../components/QuoteSummary'
import { formatMoney, todayPlus } from '../utils/format'

export function ReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [availability, setAvailability] = useState<Apartment[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Reservation>()
  const [quote, setQuote] = useState<Quote>()
  const [occupants, setOccupants] = useState<Occupant[]>([{ nombre: '', fechaNacimiento: '' }])
  const [form, setForm] = useState({
    entrada: todayPlus(0),
    salida: todayPlus(2),
    personas: 2,
    documentoTitular: '1001',
    codigoApartamento: '',
    horaLlegada: '15:00',
    canal: 'DIRECTA' as 'DIRECTA' | 'PORTAL',
    orden: '',
  })

  async function refresh() {
    try {
      const [reservationsData, apartmentsData] = await Promise.all([getReservations(), getApartments()])
      setItems(reservationsData)
      setApartments(apartmentsData)
      setSelected((current) => current ? reservationsData.find((reservation) => reservation.id === current.id) : undefined)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las reservas')
    }
  }

  useEffect(() => { void refresh() }, [])

  function estadoApartamento(codigo?: string) {
    return apartments.find((apartment) => apartment.codigo === codigo)?.estado
  }

  async function search() {
    try {
      setAvailability(await getAvailability({
        entrada: form.entrada,
        salida: form.salida,
        personas: form.personas,
        orden: form.orden || undefined,
      }))
      setForm((current) => ({ ...current, codigoApartamento: '' }))
      setQuote(undefined)
      setError('')
      setMessage('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo consultar la disponibilidad')
    }
  }

  function updateOccupant(index: number, field: keyof Occupant, value: string) {
    setOccupants((current) => current.map((occupant, position) => position === index ? { ...occupant, [field]: value } : occupant))
    setQuote(undefined)
  }

  function addOccupant() {
    setOccupants((current) => [...current, { nombre: '', fechaNacimiento: '' }])
  }

  function removeOccupant(index: number) {
    setOccupants((current) => current.filter((_, position) => position !== index))
    setQuote(undefined)
  }

  function payload() {
    return {
      documentoTitular: form.documentoTitular.trim(),
      codigoApartamento: form.codigoApartamento,
      canal: form.canal,
      entrada: form.entrada,
      salida: form.salida,
      horaLlegada: form.horaLlegada,
      ocupantes: occupants.filter((occupant) => occupant.nombre.trim() && occupant.fechaNacimiento),
    }
  }

  async function cotizar() {
    if (!form.codigoApartamento) return setError('Selecciona un apartamento disponible')
    const data = payload()
    if (!data.ocupantes.length) return setError('Registra al menos un ocupante con nombre y fecha de nacimiento')
    try {
      setQuote(await quoteReservation(data))
      setError('')
      setMessage('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cotizar la reserva')
    }
  }

  async function book() {
    if (!form.codigoApartamento) return setError('Selecciona un apartamento disponible')
    const data = payload()
    if (!data.ocupantes.length) return setError('Registra al menos un ocupante con nombre y fecha de nacimiento')
    try {
      await createReservation(data)
      setQuote(undefined)
      setAvailability([])
      setError('')
      setMessage('Reserva creada correctamente')
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la reserva')
    }
  }

  async function act(id: string, action: 'anticipo' | 'cancelar' | 'checkin' | 'checkout' | 'no-show') {
    try {
      if (action === 'cancelar') {
        const refund = await getRefund(id)
        const confirmed = window.confirm(
          `Pagado: ${formatMoney(refund.pagado)}\n` +
          `Devolución (${refund.porcentaje} %): ${formatMoney(refund.devolucion)}\n\n` +
          `¿Cancelar la reserva ${id}?`,
        )
        if (!confirmed) return
      }
      await reservationAction(id, action)
      setError('')
      setMessage(`Acción "${action}" aplicada a ${id}`)
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'La acción no pudo completarse')
    }
  }

  async function runExpirations() {
    try {
      const result = await processExpirations()
      setMessage(result.mensaje)
      setError('')
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron procesar los vencimientos')
    }
  }

  const visible = items.filter((reservation) =>
    `${reservation.id} ${reservation.documentoTitular ?? ''} ${reservation.codigoApartamento ?? ''} ${reservation.estado ?? ''}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  return (
    <section className="data-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Recepción y disponibilidad</span>
          <h1>Reservas</h1>
          <p>Busca, cotiza y mueve cada estancia sin perder el contexto.</p>
        </div>
        <div className="page-intro__actions">
          <button className="button button--ghost" onClick={() => void refresh()}><RefreshCw size={16} /> Actualizar</button>
          <button className="button button--ghost" onClick={() => void runExpirations()}><TriangleAlert size={16} /> Vencimientos</button>
        </div>
      </div>

      {(error || message) && <div className={`notice ${error ? 'notice--warning' : ''}`}><span>{error || message}</span></div>}

      <div className="reservation-grid">
        <div className="panel form-panel">
          <div className="panel-heading">
            <div><span className="section-kicker">Nueva búsqueda</span><h2>Encontrar apartamento</h2></div>
            <CalendarPlus size={20} />
          </div>
          <div className="form-grid">
            <label>Entrada<input type="date" value={form.entrada} onChange={(event) => setForm({ ...form, entrada: event.target.value })} /></label>
            <label>Salida<input type="date" value={form.salida} onChange={(event) => setForm({ ...form, salida: event.target.value })} /></label>
            <label>Personas<input type="number" min="1" value={form.personas} onChange={(event) => setForm({ ...form, personas: Number(event.target.value) })} /></label>
            <label>Documento titular<input value={form.documentoTitular} onChange={(event) => setForm({ ...form, documentoTitular: event.target.value })} /></label>
            <label>Hora de llegada<input type="time" value={form.horaLlegada} onChange={(event) => setForm({ ...form, horaLlegada: event.target.value })} /></label>
            <label>Canal<select value={form.canal} onChange={(event) => setForm({ ...form, canal: event.target.value as 'DIRECTA' | 'PORTAL' })}><option value="DIRECTA">Directa</option><option value="PORTAL">Portal</option></select></label>
            <label>Orden de disponibilidad<select value={form.orden} onChange={(event) => setForm({ ...form, orden: event.target.value })}><option value="">Por código</option><option value="precio">Precio</option><option value="capacidad">Capacidad</option><option value="dormitorios">Dormitorios</option><option value="reservas">Reservas</option></select></label>
          </div>

          <div className="occupant-block">
            <div className="occupant-heading"><strong>Ocupantes reales</strong><button className="text-button" onClick={addOccupant}><Plus size={15} /> Agregar</button></div>
            {occupants.map((occupant, index) => (
              <div className="occupant-row" key={index}>
                <input value={occupant.nombre} onChange={(event) => updateOccupant(index, 'nombre', event.target.value)} placeholder="Nombre completo" />
                <input type="date" value={occupant.fechaNacimiento} onChange={(event) => updateOccupant(index, 'fechaNacimiento', event.target.value)} />
                <button className="row-actions button-icon" onClick={() => removeOccupant(index)} disabled={occupants.length === 1} aria-label="Quitar ocupante"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>

          <div className="inline-actions">
            <button className="button button--primary button--compact" onClick={() => void search()}>Buscar disponibilidad</button>
            <button className="button button--ghost button--compact" onClick={() => void cotizar()} disabled={!form.codigoApartamento}>Cotizar</button>
          </div>

          {availability.length > 0 && (
            <div className="availability-list">
              {availability.map((apartment) => (
                <button
                  key={apartment.codigo}
                  className={`availability-item ${form.codigoApartamento === apartment.codigo ? 'availability-item--selected' : ''}`}
                  onClick={() => { setForm({ ...form, codigoApartamento: apartment.codigo }); setQuote(undefined) }}
                >
                  <span><strong>{apartment.codigo}</strong> {apartment.nombre}</span>
                  <small>{apartment.capacidad} personas · {apartment.dormitorios} habitaciones</small>
                  <Check size={16} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel form-panel">
          <div className="panel-heading">
            <div><span className="section-kicker">Antes de confirmar</span><h2>{quote ? 'Cotización' : 'Acciones rápidas'}</h2></div>
            {quote && <Receipt size={20} />}
          </div>
          {quote ? (
            <>
              <QuoteSummary quote={quote} />
              <button className="button button--primary button--compact" onClick={() => void book()}>Crear reserva</button>
            </>
          ) : (
            <div className="quick-actions">
              <button onClick={() => void loadScenario()}>Cargar escenario inicial</button>
              <button onClick={() => void refresh()}>Actualizar reservas</button>
              <button onClick={() => void runExpirations()}>Procesar vencimientos</button>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar">
        <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar reserva, titular o apartamento" /></label>
      </div>

      <div className="table-panel">
        <table>
          <thead><tr><th>Reserva</th><th>Estancia</th><th>Canal</th><th>Ocupantes</th><th>Estado</th><th>Saldo</th><th>Acciones</th></tr></thead>
          <tbody>
            {visible.map((reservation) => (
              <tr key={reservation.id}>
                <td><strong>{reservation.id}</strong><span>{reservation.documentoTitular || 'Sin titular'}</span></td>
                <td><strong>{reservation.codigoApartamento}</strong><span>{reservation.entrada} → {reservation.salida}</span></td>
                <td>{reservation.canal || 'DIRECTA'}</td>
                <td>{reservation.ocupantes?.length ? reservation.ocupantes.map((occupant) => occupant.nombre).join(', ') : 'Sin ocupantes'}</td>
                <td><span className="state-label">{reservation.estado || 'PENDIENTE'}</span></td>
                <td>{formatMoney(reservation.saldo ?? 0)}</td>
                <td>
                  <div className="row-actions">
                    {reservation.estado === 'PENDIENTE' && (
                      <button title="Pagar anticipo" onClick={() => void act(reservation.id, 'anticipo')}><Check size={15} /></button>
                    )}
                    {reservation.estado === 'CONFIRMADA' && (
                      <button
                        title={estadoApartamento(reservation.codigoApartamento) === 'PREPARADO' ? 'Check-in' : 'El apartamento no está preparado'}
                        onClick={() => void act(reservation.id, 'checkin')}
                        disabled={estadoApartamento(reservation.codigoApartamento) !== 'PREPARADO'}
                      ><LogIn size={15} /></button>
                    )}
                    {reservation.estado === 'CONFIRMADA' && (
                      <button title="No-show" onClick={() => void act(reservation.id, 'no-show')}><UserX size={15} /></button>
                    )}
                    {reservation.estado === 'EN_CURSO' && (
                      <button title="Check-out" onClick={() => void act(reservation.id, 'checkout')}><LogOut size={15} /></button>
                    )}
                    {(reservation.estado === 'PENDIENTE' || reservation.estado === 'CONFIRMADA') && (
                      <button title="Cancelar y ver devolución" onClick={() => void act(reservation.id, 'cancelar')}><X size={15} /></button>
                    )}
                    <button title="Ver folio" onClick={() => setSelected(reservation)}><Receipt size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!visible.length && <tr><td colSpan={7}><div className="empty-state">No hay reservas para mostrar.</div></td></tr>}
          </tbody>
        </table>
      </div>

      {selected && <FolioPanel reservation={selected} onClose={() => setSelected(undefined)} onChanged={() => void refresh()} />}

      <div className="prep-grid">
        <GroupPlanner />
        <ExternalChannelPanel onChanged={() => void refresh()} />
      </div>
    </section>
  )
}
