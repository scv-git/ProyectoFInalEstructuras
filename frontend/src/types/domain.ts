export type ApartmentStatus =
  | 'PREPARADO'
  | 'OCUPADO'
  | 'PENDIENTE_PREPARACION'
  | 'EN_PREPARACION'
  | 'FUERA_DE_SERVICIO'

export type Apartment = {
  codigo: string
  nombre: string
  bloque: string
  piso: number
  dormitorios: number
  capacidad: number
  caracteristicas: string
  estado?: ApartmentStatus
  motivoFueraServicio?: string
  tarifaBaja?: number
  tarifaMedia?: number
  tarifaAlta?: number
}

export type CalendarRow = {
  codigoApartamento: string
  nombre: string
  noches: string[]
}

export type MapNode = {
  id: string
  tipo: string
  nombre: string
  x: number
  y: number
  bloque?: string
  estado?: ApartmentStatus
}

export type MapConnection = {
  origen: string
  destino: string
  peso: number
  habilitada: boolean
}

export type MapData = {
  nodos: MapNode[]
  pasillos: MapConnection[]
}

export type Report = {
  desde: string
  hasta: string
  ingresosPeriodo: number
  totalConflictos: number
  tiempoPromedioPreparacionMin: number
  ocupacionPorApartamento: Array<{
    codigoApartamento: string
    nochesOcupadas: number
    porcentaje: number
  }>
}

export type Guest = {
  documento: string
  nombre: string
  fechaNacimiento?: string
  telefono?: string
  correo?: string
  foto?: string
}

export type Reservation = {
  id: string
  documentoTitular?: string
  codigoApartamento?: string
  canal?: string
  entrada?: string
  salida?: string
  horaLlegada?: string
  estado?: string
  saldo?: number
  folio?: unknown
  ocupantes?: Array<{ nombre: string; fechaNacimiento?: string }>
}

export type PreparationItem = {
  codigoApartamento?: string
  prioridad?: number
  motivo?: string
  apartamento?: Apartment
}

export type RouteResult = { camino: string[]; distancia: number }
