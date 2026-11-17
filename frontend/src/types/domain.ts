export type ApartmentStatus =
  | 'PREPARADO'
  | 'OCUPADO'
  | 'PENDIENTE_PREPARACION'
  | 'EN_PREPARACION'
  | 'FUERA_DE_SERVICIO'

export type ReservationStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'EN_CURSO'
  | 'FINALIZADA'
  | 'CANCELADA'
  | 'NO_SHOW'

export type Channel = 'PORTAL' | 'DIRECTA' | 'EXTERNA'
export type Season = 'BAJA' | 'MEDIA' | 'ALTA'
export type MovementType = 'CARGO' | 'PAGO'

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

export type BlockGroup = {
  bloque: string
  apartamentos: string[]
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
  ocupacionPorTemporada: Array<{
    temporada: Season
    nochesVendidas: number
    valorLiquidado: number
  }>
  reservasPorCanal: Array<{
    canal: Channel
    total: number
    pendientes: number
    confirmadas: number
    enCurso: number
    finalizadas: number
    canceladas: number
    noShow: number
  }>
  conflictos: ChannelConflict[]
}

export type Guest = {
  documento: string
  nombre: string
  fechaNacimiento?: string
  telefono?: string
  correo?: string
  foto?: string
}

export type Occupant = {
  nombre: string
  fechaNacimiento: string
}

export type NightLiquidation = {
  noche: string
  temporada: Season
  tarifaPorPersona: number
  personasQuePagan: number
  valor: number
}

export type Quote = {
  codigoApartamento: string
  noches: number
  personas: number
  personasQuePagan: number
  desglose: NightLiquidation[]
  total: number
  anticipo: number
}

export type Refund = {
  idReserva: string
  diasParaEntrada: number
  pagado: number
  porcentaje: number
  devolucion: number
}

export type Movement = {
  tipo: MovementType
  concepto: string
  valor: number
  fecha: string
}

export type Folio = {
  movimientos: Movement[]
  totalCargos: number
  totalPagos: number
  saldo: number
}

export type Reservation = {
  id: string
  documentoTitular?: string
  codigoApartamento?: string
  canal?: Channel
  entrada?: string
  salida?: string
  noches?: number
  horaLlegada?: string
  creada?: string
  vence?: string
  estado?: ReservationStatus
  total?: number
  anticipo?: number
  saldo?: number
  desglose?: NightLiquidation[]
  ocupantes?: Occupant[]
  folio?: Folio
}

export type ReservationInput = {
  documentoTitular: string
  codigoApartamento: string
  canal: Channel
  entrada: string
  salida: string
  horaLlegada: string
  ocupantes: Occupant[]
}

export type ExternalRequest = {
  documentoTitular: string
  codigoApartamento: string
  entrada: string
  salida: string
  horaLlegada: string
  ocupantes: Occupant[]
}

export type ExternalResult = {
  resultado: 'ACEPTADA' | 'CONFLICTO' | 'RECHAZADA'
  detalle: string
  reserva?: Reservation
}

export type ChannelConflict = {
  solicitud: ExternalRequest
  motivo: string
  fecha: string
}

export type Employee = {
  documento: string
  nombre: string
  rol: 'RECEPCIONISTA' | 'PREPARACION' | 'ADMINISTRADOR'
}

export type SeasonPeriod = {
  temporada: Season
  inicio: string
  fin: string
}

export type PreparationItem = {
  codigoApartamento?: string
  prioridad?: number
  motivo?: string
  apartamento?: Apartment
}

export type RouteResult = { camino: string[]; distancia: number }

export type Screen = { pantalla: string }
