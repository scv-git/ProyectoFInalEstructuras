import { useEffect, useState } from 'react'
import { CalendarDays, Check, Heart, History, RefreshCw, WalletCards } from 'lucide-react'
import {
  createReservation,
  getAvailability,
  getGuest,
  getGuestFavorites,
  getGuestHistory,
  getGuestReservations,
  quoteReservation,
  toggleFavorite,
} from '../api/resources'
import type { Apartment, Guest, Quote, Reservation } from '../types/domain'
import type { SessionUser } from '../auth/users'
import { QuoteSummary } from '../components/QuoteSummary'
import { todayPlus } from '../utils/format'

export function GuestPage({ user }: { user: SessionUser }) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [history, setHistory] = useState<Reservation[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [guest, setGuest] = useState<Guest>()
  const [availability, setAvailability] = useState<Apartment[]>([])
  const [selectedApartment, setSelectedApartment] = useState('')
  const [quote, setQuote] = useState<Quote>()
  const [error, setError] = useState(''); const [message, setMessage] = useState('')
  const [booking, setBooking] = useState({ entrada: todayPlus(0), salida: todayPlus(2), personas: 2 })

  async function refresh(notify = false) {
    try {
      const [current, past, saved, profile] = await Promise.all([
        getGuestReservations(user.documento),
        getGuestHistory(user.documento),
        getGuestFavorites(user.documento),
        getGuest(user.documento),
      ])
      setReservations(current)
      setHistory(past)
      setFavorites(saved)
      setGuest(profile)
      setError('')
      if (notify) setMessage('Información actualizada')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar tu información')
    }
  }

  useEffect(() => { void refresh() }, [user.documento])

  async function removeFavorite(code: string) {
    try {
      setFavorites(await toggleFavorite(user.documento, code, true))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar favoritos')
    }
  }

  async function search() {
    try {
      setAvailability(await getAvailability(booking))
      setSelectedApartment('')
      setQuote(undefined)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo buscar disponibilidad')
    }
  }

  function payload() {
    return {
      documentoTitular: user.documento,
      codigoApartamento: selectedApartment,
      canal: 'PORTAL' as const,
      entrada: booking.entrada,
      salida: booking.salida,
      horaLlegada: '15:00',
      ocupantes: [{
        nombre: guest?.nombre ?? user.nombre,
        fechaNacimiento: guest?.fechaNacimiento ?? '1990-01-01',
      }],
    }
  }

  async function cotizar() {
    if (!selectedApartment) return setError('Selecciona un apartamento')
    try {
      setQuote(await quoteReservation(payload()))
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cotizar la reserva')
    }
  }

  async function book() {
    if (!selectedApartment) return setError('Selecciona un apartamento')
    try {
      await createReservation(payload())
      await refresh()
      setAvailability([])
      setSelectedApartment('')
      setQuote(undefined)
      setError('Reserva creada correctamente')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la reserva')
    }
  }

  return (
    <section className="data-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Área personal</span>
          <h1>Hola, {user.nombre.split(' ')[0]}.</h1>
          <p>Tus estancias y lugares guardados, en un mismo sitio.</p>
        </div>
        <button className="button button--ghost" onClick={() => void refresh(true)}><RefreshCw size={16} /> Actualizar</button>
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
        </div>
        <div className="form-grid">
          <label>Entrada<input type="date" value={booking.entrada} onChange={(event) => setBooking({ ...booking, entrada: event.target.value })} /></label>
          <label>Salida<input type="date" value={booking.salida} onChange={(event) => setBooking({ ...booking, salida: event.target.value })} /></label>
          <label>Personas<input type="number" min="1" value={booking.personas} onChange={(event) => setBooking({ ...booking, personas: Number(event.target.value) })} /></label>
        </div>
        <button className="button button--primary button--compact" onClick={() => void search()}>Buscar disponibilidad</button>
        {availability.length > 0 && (
          <div className="availability-list">
            {availability.map((apartment) => (
              <button
                className={`availability-item ${selectedApartment === apartment.codigo ? 'availability-item--selected' : ''}`}
                key={apartment.codigo}
                onClick={() => { setSelectedApartment(apartment.codigo); setQuote(undefined) }}
              >
                <span><strong>{apartment.codigo}</strong> {apartment.nombre}</span>
                <small>Hasta {apartment.capacidad} personas</small>
                <Check size={16} />
              </button>
            ))}
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
                <div className="guest-item" key={reservation.id}>
                  <div><strong>{reservation.codigoApartamento}</strong><span>{reservation.entrada} → {reservation.salida}</span></div>
                  <span className="state-label">{reservation.estado}</span>
                  <span className="balance"><WalletCards size={14} /> Saldo: {reservation.saldo ?? 'consultar'}</span>
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
                  <button className="table-action" onClick={() => void removeFavorite(code)}>Quitar</button>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">Todavía no tienes favoritos.</div>}
        </div>
      </div>
    </section>
  )
}
