import { useEffect, useState } from 'react'
import { ArrowRight, Layers, Lock, MapPinned, RefreshCw, Route, Unlock } from 'lucide-react'
import { getBlocks, getMap, getMapRoute, getUnreachable, setCorridor, traverseMap } from '../api/resources'
import type { BlockGroup, MapConnection, MapData, RouteResult } from '../types/domain'
import { MapPreview } from '../components/MapPreview'

export function MapPage() {
  const [map, setMap] = useState<MapData>()
  const [route, setRoute] = useState<RouteResult>()
  const [origin, setOrigin] = useState('REC')
  const [destination, setDestination] = useState('')
  const [unreachable, setUnreachable] = useState<string[]>([])
  const [blocks, setBlocks] = useState<BlockGroup[]>([])
  const [traversal, setTraversal] = useState<{ type: 'bfs' | 'dfs'; nodes: string[] }>()
  const [error, setError] = useState(''); const [message, setMessage] = useState('')

  async function refresh(notify = false) {
    try {
      const [mapData, unreachableData, blockData] = await Promise.all([getMap(), getUnreachable(), getBlocks()])
      setMap(mapData)
      setUnreachable(unreachableData)
      setBlocks(blockData)
      if (mapData.nodos.length && !mapData.nodos.some((node) => node.id === origin)) {
        setOrigin(mapData.nodos[0].id)
      }
      setError('')
      if (notify) setMessage('Mapa actualizado')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar el mapa')
    }
  }

  useEffect(() => { void refresh() }, [])

  async function calculate() {
    if (!destination) return
    try {
      setRoute(await getMapRoute(origin, destination))
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo calcular la ruta')
    }
  }

  async function toggleCorridor(connection: MapConnection) {
    try {
      await setCorridor(connection.origen, connection.destino, !connection.habilitada)
      setRoute(undefined)
      setTraversal(undefined)
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cambiar el pasillo')
    }
  }

  async function runTraversal(type: 'bfs' | 'dfs') {
    try {
      setTraversal({ type, nodes: await traverseMap(type, origin || undefined) })
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo recorrer el mapa')
    }
  }

  return (
    <section className="data-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Navegación interior</span>
          <h1>Mapa del edificio</h1>
          <p>El grafo real del edificio, con estados y recorridos.</p>
        </div>
        <button className="button button--ghost" onClick={() => void refresh(true)}><RefreshCw size={16} /> Actualizar</button>
      </div>

      {(error || message) && <div className={`notice ${error ? 'notice--warning' : ''}`}>{error || message}</div>}

      <div className="map-workspace">
        <div className="panel map-panel-large">
          <div className="panel-heading">
            <div><span className="section-kicker">Plano en vivo</span><h2>{map?.nodos.length ?? 0} nodos conectados</h2></div>
            <MapPinned size={20} />
          </div>
          <MapPreview data={map} route={route?.camino} onCorridorClick={(connection) => void toggleCorridor(connection)} />
        </div>

        <div className="panel map-controls">
          <div className="panel-heading">
            <div><span className="section-kicker">Herramientas</span><h2>Calcular recorrido</h2></div>
            <Route size={20} />
          </div>
          <label>Origen<select value={origin} onChange={(event) => setOrigin(event.target.value)}>{map?.nodos.map((node) => <option key={node.id} value={node.id}>{node.id} · {node.nombre}</option>)}</select></label>
          <label>Destino<select value={destination} onChange={(event) => setDestination(event.target.value)}><option value="">Selecciona un nodo</option>{map?.nodos.map((node) => <option key={node.id} value={node.id}>{node.id} · {node.nombre}</option>)}</select></label>
          <button className="button button--primary button--compact" onClick={() => void calculate()}>Calcular ruta <ArrowRight size={16} /></button>
          {route && (
            <div className="route-summary">
              <strong>{route.distancia < 0 ? 'Sin ruta disponible' : `${route.distancia} metros`}</strong>
              <span>{route.camino?.length ? route.camino.join(' → ') : 'Los pasillos actuales no permiten llegar.'}</span>
            </div>
          )}

          <hr />

          <div className="map-section">
            <strong>Pasillos</strong>
            <div className="corridor-list">
              {map?.pasillos.map((connection) => (
                <div className="corridor-item" key={`${connection.origen}-${connection.destino}`}>
                  <span><strong>{connection.origen} ↔ {connection.destino}</strong><small>{connection.peso} m · {connection.habilitada ? 'abierto' : 'cerrado'}</small></span>
                  <button className="table-action" onClick={() => void toggleCorridor(connection)}>
                    {connection.habilitada ? <><Lock size={14} /> Cerrar</> : <><Unlock size={14} /> Abrir</>}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="inline-actions">
            <button className="button button--ghost button--compact" onClick={() => void runTraversal('bfs')}>BFS</button>
            <button className="button button--ghost button--compact" onClick={() => void runTraversal('dfs')}>DFS</button>
          </div>
          {traversal && (
            <div className="route-summary">
              <strong>{traversal.type.toUpperCase()} · {traversal.nodes.length} nodos</strong>
              <span>{traversal.nodes.join(' → ')}</span>
            </div>
          )}

          <div className="map-section">
            <strong><Layers size={15} /> Bloques</strong>
            <div className="block-list">
              {blocks.map((block) => (
                <div className="corridor-item" key={block.bloque}>
                  <span><strong>Bloque {block.bloque}</strong><small>{block.apartamentos.join(', ')}</small></span>
                </div>
              ))}
              {!blocks.length && <span className="empty-inline">Sin bloques cargados.</span>}
            </div>
          </div>

          {unreachable.length > 0 && (
            <div className="closed-list">
              <strong>Inalcanzables</strong>
              <span>{unreachable.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
