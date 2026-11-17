import { ArrowUpRight, BedDouble, UsersRound } from 'lucide-react'
import type { Apartment } from '../types/domain'
import { StatusPill } from './StatusPill'

export function ApartmentCard({ apartment }: { apartment: Apartment }) {
  return (
    <article className="apartment-card">
      <div className="apartment-card__topline">
        <span className="apartment-code">{apartment.codigo}</span>
        <button className="icon-button" aria-label={`Abrir ${apartment.nombre}`}><ArrowUpRight size={17} /></button>
      </div>
      <h3>{apartment.nombre}</h3>
      <StatusPill status={apartment.estado} />
      <div className="apartment-card__meta">
        <span><BedDouble size={15} /> {apartment.dormitorios} habitaciones</span>
        <span><UsersRound size={15} /> Hasta {apartment.capacidad}</span>
      </div>
      {apartment.estado === 'FUERA_DE_SERVICIO' && apartment.motivoFueraServicio ? <p className="status-reason"><strong>Motivo:</strong> {apartment.motivoFueraServicio}</p> : <p>{apartment.caracteristicas || 'Apartamento listo para asignar.'}</p>}
    </article>
  )
}
