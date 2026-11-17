import type { ApartmentStatus } from '../types/domain'

const labels: Record<ApartmentStatus, string> = {
  PREPARADO: 'Preparado',
  OCUPADO: 'Ocupado',
  PENDIENTE_PREPARACION: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  FUERA_DE_SERVICIO: 'Fuera de servicio',
}

export function StatusPill({ status = 'PREPARADO' }: { status?: ApartmentStatus }) {
  return <span className={`status-pill status-${status.toLowerCase()}`}><span />{labels[status]}</span>
}
