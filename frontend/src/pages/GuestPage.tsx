import { useEffect, useState } from 'react'
import { CalendarDays, Check, Heart, History, RefreshCw, Upload, UserRound, WalletCards, X } from 'lucide-react'
import {
  createReservation,
  getAvailability,
  getGuest,
  getGuestFavorites,
  getGuestHistory,
  getGuestReservations,
  getRefund,
  quoteReservation,
  reservationAction,
  toggleFavorite,
  updateGuest,
} from '../api/resources'
import type { Apartment, Guest, Occupant, Quote, Refund, Reservation } from '../types/domain'
import type { SessionUser } from '../auth/users'
import { QuoteSummary } from '../components/QuoteSummary'
import { formatMoney, todayPlus } from '../utils/format'

const emptyOccupant = (): Occupant => ({ nombre: '', fechaNacimiento: '' })

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })
}

export function GuestPage({ user }: { user: SessionUser }) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [history, setHistory] = useState<Reservation[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [guest, setGuest] = useState<Guest>()
  const [availability, setAvailability] = useState<Apartment[]>([])
  const [selectedApartment, setSelectedApartment] = useState('')
  const [quote, setQuote] = useState<Quote>()
  const [error, setError] = useState(''); const [message, setMessage] = useState('')
  const [booking, setBooking] = useState({ entrada: todayPlus(0), salida: todayPlus(2), personas: 2, orden: '', horaLlegada: '15:00' })
  const [occupants, setOccupants] = useState<Occupant[]>(() => [emptyOccupant(), emptyOccupant()])
  const [refundModal, setRefundModal] = useState<{ reservation: Reservation; refund: Refund }>()
  const [showProfile, setShowProfile] = useState(false)
  const [profile, setProfile] = useState({ nombre: '', fechaNacimiento: '', telefono: '', correo: '', foto: '' })

  async function refresh(notify = false) {
    try {
      const [current, past, saved, data] = await Promise.all([
        getGuestReservations(user.documento),
        getGuestHistory(user.documento),
        getGuestFavorites(user.documento),
        getGuest(user.documento),
      ])
      setReservations(current)
      setHistory(past)
      setFavorites(saved)
      setGuest(data)
      setOccupants((rows) => {
        if (!rows[0]?.nombre && !rows[0]?.fechaNacimiento) {
          const next = [...rows]
          next[0] = { nombre: data.nombre ?? user.nombre, fechaNacimiento: data.fechaNacimiento ?? '' }
          return next
        }
        return rows
      })
      setError('')
      if (notify) setMessage('Información actualizada')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar tu información')
    }
  }

  useEffect(() => { void refresh() }, [user.documento])

  function resizeOccupants(count: number) {
    const next = Math.max(1, count)
    setOccupants((rows) => next <= rows.length
      ? rows.slice(0, next)
      : [...rows, ...Array.from({ length: next - rows.length }, emptyOccupant)])
    setBooking((current) => ({ ...current, personas: next }))
    setQuote(undefined)
  }

  function updateOccupant(index: number, field: keyof Occupant, value: string) {
    setOccupants((rows) => rows.map((row, position) => position === index ? { ...row, [field]: value } : row))
    setQuote(undefined)
  }

  function removeOccupant(index: number) {
    if (occupants.length <= 1) return
    setOccupants((rows) => rows.filter((_, position) => position !== index))
    setBooking((current) => ({ ...current, personas: Math.max(1, occupants.length - 1) }))
    setQuote(undefined)
  }

  function selectedApartmentData() {
    return availability.find((apartment) => apartment.codigo === selectedApartment)
  }

  function buildOccupants(): Occupant[] | null {
    const filled = occupants.map((occupant) => ({ nombre: occupant.nombre.trim(), fechaNacimiento: occupant.fechaNacimiento }))
    if (filled.some((occupant) => !occupant.nombre || !occupant.fechaNacimiento)) {
      setError('Completa el nombre y la fecha de nacimiento de todos los ocupantes.')
      return null
    }
    const apartment = selectedApartmentData()
    if (apartment && filled.length > apartment.capacidad) {
      setError(`El apartamento ${apartment.codigo} admite máximo ${apartment.capacidad} personas y registraste ${filled.length}.`)
      return null
    }
    return filled
  }

  function payload(ocupantes: Occupant[]) {
    return {
      documentoTitular: user.documento,
      codigoApartamento: selectedApartment,
      canal: 'PORTAL' as const,
      entrada: booking.entrada,
      salida: booking.salida,
      horaLlegada: booking.horaLlegada,
      ocupantes,
    }
  }

  async function search() {
    try {
      setAvailability(await getAvailability({
        entrada: booking.entrada,
        salida: booking.salida,
        personas: booking.personas,
        orden: booking.orden || undefined,
      }))
      setSelectedApartment('')
      setQuote(undefined)
      setError('')
      setMessage('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo buscar disponibilidad')
    }
  }

  async function cotizar() {
    if (!selectedApartment) return setError('Selecciona un apartamento')
    const ocupantes = buildOccupants()
    if (!ocupantes) return
    try {
      setQuote(await quoteReservation(payload(ocupantes)))
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cotizar la reserva')
    }
  }

  async function book() {
    if (!selectedApartment) return setError('Selecciona un apartamento')
    const ocupantes = buildOccupants()
    if (!ocupantes) return
    try {
      await createReservation(payload(ocupantes))
      await refresh()
      setAvailability([])
      setSelectedApartment('')
      setQuote(undefined)
      setError('')
      setMessage('Reserva creada correctamente')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la reserva')
    }
  }

  async function payDeposit(reservation: Reservation) {
    try {
      await reservationAction(reservation.id, 'anticipo')
      await refresh()
      setError('')
      setMessage(`Anticipo pagado. La reserva ${reservation.id} quedó confirmada.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo pagar el anticipo')
    }
  }

  async function openCancel(reservation: Reservation) {
    try {
      const refund = await getRefund(reservation.id)
      setRefundModal({ reservation, refund })
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo calcular la devolución')
    }
  }

  async function confirmCancel() {
    if (!refundModal) return
    try {
      const refund = await reservationAction(refundModal.reservation.id, 'cancelar') as Refund
      setRefundModal(undefined)
      await refresh()
      setError('')
      setMessage(`Reserva cancelada. Devolución: ${formatMoney(refund.devolucion)} (${refund.porcentaje} %).`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cancelar la reserva')
    }
  }

  async function toggleFav(code: string) {
    const isFavorite = favorites.includes(code)
    try {
      setFavorites(await toggleFavorite(user.documento, code, isFavorite))
      setMessage(isFavorite ? `Se quitó ${code} de favoritos` : `Se guardó ${code} en favoritos`)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar favoritos')
    }
  }

  function openProfile() {
    setProfile({
      nombre: guest?.nombre ?? user.nombre,
      fechaNacimiento: guest?.fechaNacimiento ?? '',
      telefono: guest?.telefono ?? '',
      correo: guest?.correo ?? '',
      foto: guest?.foto ?? '',
    })
    setShowProfile(true)
  }

  async function pickPhoto(file?: File) {
    if (!file) return
    if (file.size > 2_000_000) return setError('La imagen debe pesar menos de 2 MB.')
    try {
      const foto = await readImage(file)
      setProfile((current) => ({ ...current, foto }))
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo leer la imagen')
    }
  }

  async function saveProfile() {
    if (!profile.nombre.trim() || !profile.fechaNacimiento) return setError('Nombre y fecha de nacimiento son obligatorios.')
    try {
      await updateGuest(user.documento, { documento: user.documento, ...profile, nombre: profile.nombre.trim() })
      setShowProfile(false)
      await refresh()
      setError('')
      setMessage('Perfil actualizado')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el perfil')
    }
  }

  const initials = (guest?.nombre ?? user.nombre).split(' ').map((part) => part[0]).slice(0, 2).join('')

  return (
    <section className="data-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Área personal</span>
          <h1>Hola, {user.nombre.split(' ')[0]}.</h1>
          <p>Tus estancias y lugares guardados, en un mismo sitio.</p>
        </div>
        <div className="page-intro__actions">
          <button className="button button--ghost" onClick={openProfile}><UserRound size={16} /> Mi perfil</button>
          <button className="button button--ghost" onClick={() => void refresh(true)}><RefreshCw size={16} /> Actualizar</button>
        </div>
      </div>

      {(error || message) && <div className={`notice ${error ? 'notice--warning' : ''}`}>{error || message}</div>}

      <div className="guest-stats">
        <div className="metric-card"><CalendarDays size={19} /><strong>{reservations.length}</strong><small>reservas activas</small></div>
        <div className="metric-card"><History size={19} /><strong>{history.length}</strong><small>estancias finalizadas</small></div>
        <div className="metric-card"><Heart size={19} /><strong>{favorites.length}</strong><small>apartamentos favoritos</small></div>
      </div>

      <div className="panel guest-booking">
        <div className="panel-heading">
          <div><span className="section-kicker">Reservar por portal</span><h2>Encuentra tu próxima estancia</h2></div>
          <div className="guest-avatar">
            {guest?.foto ? <img src={guest.foto} alt={guest.nombre} /> : <span>{initials}</span>}
          </div>
        </div>
        <div className="form-grid">
          <label>Entrada<input type="date" value={booking.entrada} onChange={(event) => setBooking({ ...booking, entrada: event.target.value })} /></label>
          <label>Salida<input type="date" value={booking.salida} onChange={(event) => setBooking({ ...booking, salida: event.target.value })} /></label>
          <label>Personas<input type="number" min="1" value={booking.personas} onChange={(event) => resizeOccupants(Number(event.target.value) || 1)} /></label>
          <label>Hora de llegada<input type="time" value={booking.horaLlegada} onChange={(event) => setBooking({ ...booking, horaLlegada: event.target.value })} /></label>
          <label>Ordenar disponibilidad
            <select value={booking.orden} onChange={(event) => setBooking({ ...booking, orden: event.target.value })}>
              <option value="">Por código</option>
              <option value="precio">Precio</option>
              <option value="capacidad">Capacidad</option>
              <option value="dormitorios">Dormitorios</option>
              <option value="reservas">Reservas</option>
            </select>
          </label>
        </div>

        <div className="occupant-block">
          <div className="occupant-heading"><strong>Ocupantes con fecha de nacimiento</strong></div>
          {occupants.map((occupant, index) => (
            <div className="occupant-row" key={index}>
              <input value={occupant.nombre} onChange={(event) => updateOccupant(index, 'nombre', event.target.value)} placeholder="Nombre completo" />
              <input type="date" value={occupant.fechaNacimiento} onChange={(event) => updateOccupant(index, 'fechaNacimiento', event.target.value)} />
              <button className="row-actions button-icon" onClick={() => removeOccupant(index)} disabled={occupants.length === 1} aria-label="Quitar ocupante"><X size={15} /></button>
            </div>
          ))}
        </div>

        <button className="button button--primary button--compact" onClick={() => void search()}>Buscar disponibilidad</button>
        {availability.length > 0 && (
          <div className="availability-list">
            {availability.map((apartment) => {
              const isFavorite = favorites.includes(apartment.codigo)
              return (
                <div
                  className={`availability-item ${selectedApartment === apartment.codigo ? 'availability-item--selected' : ''}`}
                  key={apartment.codigo}
                  onClick={() => { setSelectedApartment(apartment.codigo); setQuote(undefined) }}
                >
                  <span><strong>{apartment.codigo}</strong> {apartment.nombre}</span>
                  <small>Hasta {apartment.capacidad} personas</small>
                  <button
                    className="table-action"
                    title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    onClick={(event) => { event.stopPropagation(); void toggleFav(apartment.codigo) }}
                  >
                    <Heart size={16} style={{ color: isFavorite ? '#c86b5b' : '#9fb3ba' }} fill={isFavorite ? '#c86b5b' : 'none'} />
                  </button>
                  <Check size={16} />
                </div>
              )
            })}
            <button className="button button--ghost button--compact" onClick={() => void cotizar()} disabled={!selectedApartment}>Cotizar</button>
            {quote && <QuoteSummary quote={quote} />}
            {quote && <button className="button button--primary button--compact" onClick={() => void book()}>Confirmar reserva</button>}
          </div>
        )}
      </div>

      <div className="guest-grid">
        <div className="panel">
          <div className="panel-heading">
            <div><span className="section-kicker">Próximas estancias</span><h2>Mis reservas</h2></div>
          </div>
          {reservations.length ? (
            <div className="guest-list">
              {reservations.map((reservation) => (
                <div className="guest-item guest-item--actions" key={reservation.id}>
                  <div><strong>{reservation.codigoApartamento}</strong><span>{reservation.entrada} → {reservation.salida}</span></div>
                  <span className="state-label">{reservation.estado}</span>
                  <span className="balance"><WalletCards size={14} /> Saldo: {formatMoney(reservation.saldo ?? 0)}</span>
                  {reservation.estado === 'PENDIENTE' && (
                    <span className="balance">Anticipo: {formatMoney(reservation.anticipo ?? 0)}</span>
                  )}
                  <div className="row-actions">
                    {reservation.estado === 'PENDIENTE' && (
                      <button className="table-action" onClick={() => void payDeposit(reservation)}>Pagar anticipo</button>
                    )}
                    {(reservation.estado === 'PENDIENTE' || reservation.estado === 'CONFIRMADA') && (
                      <button className="table-action table-action--danger" onClick={() => void openCancel(reservation)}>Cancelar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">No tienes reservas activas.</div>}
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div><span className="section-kicker">Tus lugares</span><h2>Favoritos</h2></div>
          </div>
          {favorites.length ? (
            <div className="guest-list">
              {favorites.map((code) => (
                <div className="guest-item" key={code}>
                  <strong>{code}</strong>
                  <button className="table-action" onClick={() => void toggleFav(code)}>Quitar</button>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">Todavía no tienes favoritos. Guarda uno desde la disponibilidad.</div>}
        </div>
      </div>

      {refundModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <h3>Cancelar reserva {refundModal.reservation.id}</h3>
              <button className="modal-close" onClick={() => setRefundModal(undefined)}>Cerrar</button>
            </div>
            <div className="refund-summary">
              <div><span>Días para la entrada</span><strong>{refundModal.refund.diasParaEntrada}</strong></div>
              <div><span>Pagado</span><strong>{formatMoney(refundModal.refund.pagado)}</strong></div>
              <div><span>Porcentaje a devolver</span><strong>{refundModal.refund.porcentaje} %</strong></div>
              <div className="refund-total"><span>Devolución estimada</span><strong>{formatMoney(refundModal.refund.devolucion)}</strong></div>
            </div>
            <div className="form-actions">
              <button className="button button--ghost" onClick={() => setRefundModal(undefined)}>Volver</button>
              <button className="button button--primary" onClick={() => void confirmCancel()}>Confirmar cancelación</button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <h3>Mi perfil</h3>
              <button className="modal-close" onClick={() => setShowProfile(false)}>Cerrar</button>
            </div>
            <div className="profile-photo">
              {profile.foto ? <img src={profile.foto} alt="Foto de perfil" /> : <span>{initials}</span>}
            </div>
            <label className="form-label">Foto (opcional)</label>
            <label className="button button--ghost button--compact file-button">
              <Upload size={16} /> Elegir imagen
              <input type="file" accept="image/*" hidden onChange={(event) => void pickPhoto(event.target.files?.[0])} />
            </label>
            <label className="form-label">Nombre completo</label>
            <input className="form-input" value={profile.nombre} onChange={(event) => setProfile({ ...profile, nombre: event.target.value })} />
            <label className="form-label">Fecha de nacimiento</label>
            <input className="form-input" type="date" value={profile.fechaNacimiento} onChange={(event) => setProfile({ ...profile, fechaNacimiento: event.target.value })} />
            <label className="form-label">Teléfono</label>
            <input className="form-input" value={profile.telefono} onChange={(event) => setProfile({ ...profile, telefono: event.target.value })} />
            <label className="form-label">Correo</label>
            <input className="form-input" value={profile.correo} onChange={(event) => setProfile({ ...profile, correo: event.target.value })} />
            <div className="form-actions">
              <button className="button button--ghost" onClick={() => setShowProfile(false)}>Cancelar</button>
              <button className="button button--primary" onClick={() => void saveProfile()}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
