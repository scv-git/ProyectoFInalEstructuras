import { MapPinned } from 'lucide-react'
import type { MapData } from '../types/domain'
import { StatusPill } from './StatusPill'

export function MapPreview({ data }: { data?: MapData }) {
  if (!data) {
    return <div className="map-placeholder"><MapPinned size={28} /><strong>El plano aparecerá al cargar el escenario</strong><span>Conecta la API para ver rutas y estados en tiempo real.</span></div>
  }

  const maxX = Math.max(...data.nodos.map((node) => node.x), 1)
  const maxY = Math.max(...data.nodos.map((node) => node.y), 1)
  const nodeById = new Map(data.nodos.map((node) => [node.id, node]))

  return (
    <div className="map-preview">
      <svg viewBox={`0 0 ${maxX + 80} ${maxY + 80}`} role="img" aria-label="Mapa de apartamentos y pasillos">
        {data.pasillos.map((connection) => {
          const from = nodeById.get(connection.origen)
          const to = nodeById.get(connection.destino)
          if (!from || !to) return null
          return <line key={`${connection.origen}-${connection.destino}`} x1={from.x + 40} y1={from.y + 40} x2={to.x + 40} y2={to.y + 40} className={connection.habilitada ? 'map-line' : 'map-line map-line--closed'} />
        })}
        {data.nodos.map((node) => <g key={node.id} transform={`translate(${node.x + 40}, ${node.y + 40})`} className={`map-node map-node--${node.estado?.toLowerCase() ?? 'service'}`}><circle r="16" /><text y="4" textAnchor="middle">{node.id}</text></g>)}
      </svg>
      <div className="map-legend"><StatusPill status="PREPARADO" /><StatusPill status="OCUPADO" /><StatusPill status="PENDIENTE_PREPARACION" /></div>
    </div>
  )
}
