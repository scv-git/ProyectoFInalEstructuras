import { api } from './client'
import type { Apartment, CalendarRow, Guest, MapData, PreparationItem, Report, Reservation, RouteResult } from '../types/domain'

export function getApartments(order?: string) {
  const query = order ? `?orden=${encodeURIComponent(order)}` : ''
  return api<Apartment[]>(`/apartamentos${query}`)
}

export function getCalendar(year: number, month: number) {
  return api<CalendarRow[]>(`/apartamentos/calendario?anio=${year}&mes=${month}`)
}

export function getMap() {
  return api<MapData>('/mapa')
}

export function getReport(from?: string, to?: string) {
  const query = from && to ? `?desde=${from}&hasta=${to}` : ''
  return api<Report>(`/reportes${query}`)
}

export function loadScenario() {
  return api<{ mensaje: string }>('/datos/cargar', { method: 'POST' })
}

export function createApartment(data: unknown) { return api<Apartment>('/apartamentos', { method: 'POST', body: JSON.stringify(data) }) }
export function updateApartment(code: string, data: unknown) { return api<Apartment>(`/apartamentos/${encodeURIComponent(code)}`, { method: 'PUT', body: JSON.stringify(data) }) }
export function deleteApartment(code: string) { return api<void>(`/apartamentos/${encodeURIComponent(code)}`, { method: 'DELETE' }) }
export function updateApartmentStatus(code: string, data: unknown) { return api<Apartment>(`/apartamentos/${encodeURIComponent(code)}/estado`, { method: 'PUT', body: JSON.stringify(data) }) }
export function getApartmentReservations(code: string) { return api<Reservation[]>(`/apartamentos/${encodeURIComponent(code)}/reservas`) }

export function getGuests() { return api<Guest[]>('/huespedes') }
export function createGuest(data: unknown) { return api<Guest>('/huespedes', { method: 'POST', body: JSON.stringify(data) }) }
export function updateGuest(document: string, data: unknown) { return api<Guest>(`/huespedes/${encodeURIComponent(document)}`, { method: 'PUT', body: JSON.stringify(data) }) }
export function deleteGuest(document: string) { return api<void>(`/huespedes/${encodeURIComponent(document)}`, { method: 'DELETE' }) }
export function getGuestReservations(document: string) { return api<Reservation[]>(`/huespedes/${encodeURIComponent(document)}/reservas`) }
export function getGuestHistory(document: string) { return api<Reservation[]>(`/huespedes/${encodeURIComponent(document)}/historial`) }
export function getGuestFavorites(document: string) { return api<string[]>(`/huespedes/${encodeURIComponent(document)}/favoritos`) }
export function toggleFavorite(document: string, code: string, remove = false) { return api<string[]>(`/huespedes/${encodeURIComponent(document)}/favoritos/${encodeURIComponent(code)}`, { method: remove ? 'DELETE' : 'POST' }) }

export function getReservations() { return api<Reservation[]>('/reservas') }
export function getAvailability(params: { entrada: string; salida: string; personas: number; orden?: string }) { const query = new URLSearchParams({ entrada: params.entrada, salida: params.salida, personas: String(params.personas), ...(params.orden ? { orden: params.orden } : {}) }); return api<Apartment[]>(`/reservas/disponibilidad?${query}`) }
export function quoteReservation(data: unknown) { return api<unknown>('/reservas/cotizar', { method: 'POST', body: JSON.stringify(data) }) }
export function createReservation(data: unknown) { return api<Reservation>('/reservas', { method: 'POST', body: JSON.stringify(data) }) }
export function reservationAction(id: string, action: 'anticipo' | 'cancelar' | 'checkin' | 'checkout' | 'no-show') { return api<unknown>(`/reservas/${encodeURIComponent(id)}/${action}`, { method: 'POST' }) }
export function getFolio(id: string) { return api<unknown>(`/reservas/${encodeURIComponent(id)}/folio`) }
export function folioMovement(id: string, type: 'cargos' | 'pagos', data: unknown) { return api<unknown>(`/reservas/${encodeURIComponent(id)}/folio/${type}`, { method: 'POST', body: JSON.stringify(data) }) }
export function undoFolio(id: string) { return api<unknown>(`/reservas/${encodeURIComponent(id)}/folio/deshacer`, { method: 'POST' }) }
export function getExternalReservations() { return api<unknown[]>('/reservas/externas') }
export function processExternalReservation() { return api<unknown>('/reservas/externas/procesar', { method: 'POST' }) }
export function getReservationConflicts() { return api<unknown[]>('/reservas/conflictos') }
export function processExpirations() { return api<{ mensaje: string }>('/reservas/vencimientos', { method: 'POST' }) }

export function getPreparationQueue() { return api<PreparationItem[]>('/preparacion') }
export function dispatchPreparation() { return api<PreparationItem>('/preparacion/despachar', { method: 'POST' }) }
export function finishPreparation(code: string) { return api<Apartment>(`/preparacion/${encodeURIComponent(code)}/terminar`, { method: 'POST' }) }
export function getPreparationRoute() { return api<RouteResult>('/preparacion/ruta') }

export function getMapRoute(origin: string, destination: string) { return api<RouteResult>(`/mapa/ruta?origen=${encodeURIComponent(origin)}&destino=${encodeURIComponent(destination)}`) }
export function setCorridor(origin: string, destination: string, open: boolean) { return api<string[]>(`/mapa/pasillos/${open ? 'abrir' : 'cerrar'}`, { method: 'POST', body: JSON.stringify({ origen: origin, destino: destination }) }) }
export function getUnreachable() { return api<string[]>('/mapa/inalcanzables') }
export function traverseMap(type: 'bfs' | 'dfs', origin?: string) { return api<string[]>(`/mapa/${type}${origin ? `?origen=${encodeURIComponent(origin)}` : ''}`) }

export function getEmployees() { return api<unknown[]>('/empleados') }
export function createEmployee(data: unknown) { return api<unknown>('/empleados', { method: 'POST', body: JSON.stringify(data) }) }
export function deleteEmployee(document: string) { return api<void>(`/empleados/${encodeURIComponent(document)}`, { method: 'DELETE' }) }
export function getCurrentShift() { return api<unknown>('/turnos/actual') }
export function rotateShift() { return api<unknown>('/turnos/rotar', { method: 'POST' }) }
export function getSeasons() { return api<unknown[]>('/temporadas') }
export function createSeason(data: unknown) { return api<unknown>('/temporadas', { method: 'POST', body: JSON.stringify(data) }) }
export function deleteSeason(index: number) { return api<void>(`/temporadas/${index}`, { method: 'DELETE' }) }
