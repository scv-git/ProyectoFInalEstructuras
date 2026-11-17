import { useEffect, useState } from 'react'
import { BarChart3, RefreshCw } from 'lucide-react'
import { getReport } from '../api/resources'
import type { Report } from '../types/domain'

const canalLabels: Record<string, string> = { PORTAL: 'Portal', DIRECTA: 'Directa', EXTERNA: 'Externa' }

export function StatsPage() {
  const now = new Date()
  const [report, setReport] = useState<Report>()
  const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10))
  const [to, setTo] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10))
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function refresh(notify = false) {
    try {
      setReport(await getReport(from, to))
      setError('')
      if (notify) setMessage('Estadísticas actualizadas')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el reporte')
    }
  }
  useEffect(() => { void refresh() }, [])

  const max = Math.max(...(report?.ocupacionPorApartamento ?? []).map((item) => item.porcentaje), 1)
  const maxSeason = Math.max(...(report?.ocupacionPorTemporada ?? []).map((item) => item.nochesVendidas), 1)

  return (
    <section className="data-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Lectura del negocio</span>
          <h1>Estadísticas</h1>
          <p>La operación convertida en decisiones para el siguiente periodo.</p>
        </div>
        <button className="button button--ghost" onClick={() => void refresh(true)}><RefreshCw size={16} /> Actualizar</button>
      </div>
      {(error || message) && <div className={`notice ${error ? 'notice--warning' : ''}`}>{error || message}</div>}

      <div className="toolbar date-toolbar">
        <label>Desde<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label>Hasta<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <button className="button button--primary button--compact" onClick={() => void refresh(true)}>Aplicar periodo</button>
      </div>

      <section className="metric-row">
        <div className="metric-card metric-card--dark"><BarChart3 size={19} /><strong>{formatMoney(report?.ingresosPeriodo ?? 0)}</strong><small>ingresos del periodo</small></div>
        <div className="metric-card"><span>Conflictos de canal</span><strong>{report?.totalConflictos ?? '—'}</strong><small>registrados</small></div>
        <div className="metric-card"><span>Tiempo de preparación</span><strong>{report?.tiempoPromedioPreparacionMin ?? '—'}</strong><small>minutos promedio</small></div>
      </section>

      <div className="panel chart-panel">
        <div className="panel-heading"><div><span className="section-kicker">Ocupación</span><h2>Por apartamento</h2></div></div>
        <div className="bars">
          {report?.ocupacionPorApartamento?.map((item) => (
            <div className="bar-row" key={item.codigoApartamento}>
              <span>{item.codigoApartamento}</span>
              <div><i style={{ width: `${Math.min((item.porcentaje / max) * 100, 100)}%` }} /></div>
              <strong>{item.porcentaje}%</strong>
            </div>
          )) ?? <div className="empty-state">Carga un reporte para ver la ocupación.</div>}
        </div>
      </div>

      <div className="stats-grid">
        <div className="panel">
          <div className="panel-heading"><div><span className="section-kicker">Mix comercial</span><h2>Reservas por canal</h2></div></div>
          <div className="table-panel table-panel--flat">
            <table>
              <thead>
                <tr><th>Canal</th><th>Total</th><th>Pend.</th><th>Conf.</th><th>En curso</th><th>Fin.</th><th>Cancel.</th><th>No-show</th></tr>
              </thead>
              <tbody>
                {report?.reservasPorCanal?.length ? report.reservasPorCanal.map((row) => (
                  <tr key={row.canal}>
                    <td><strong>{canalLabels[row.canal] ?? row.canal}</strong></td>
                    <td>{row.total}</td>
                    <td>{row.pendientes}</td>
                    <td>{row.confirmadas}</td>
                    <td>{row.enCurso}</td>
                    <td>{row.finalizadas}</td>
                    <td>{row.canceladas}</td>
                    <td>{row.noShow}</td>
                  </tr>
                )) : <tr><td colSpan={8}><div className="empty-state">Sin reservas en el periodo.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading"><div><span className="section-kicker">Temporadas</span><h2>Ocupación por temporada</h2></div></div>
          <div className="bars">
            {report?.ocupacionPorTemporada?.map((item) => (
              <div className="bar-row" key={item.temporada}>
                <span>{item.temporada}</span>
                <div><i style={{ width: `${Math.min((item.nochesVendidas / maxSeason) * 100, 100)}%` }} /></div>
                <strong>{item.nochesVendidas}</strong>
              </div>
            )) ?? <div className="empty-state">Sin datos de temporadas.</div>}
          </div>
          <div className="season-values">
            {report?.ocupacionPorTemporada?.map((item) => (
              <div key={item.temporada}><span>{item.temporada}</span><strong>{formatMoney(item.valorLiquidado)}</strong></div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading"><div><span className="section-kicker">Canal externo</span><h2>Conflictos de canal ({report?.totalConflictos ?? 0})</h2></div></div>
        {report?.conflictos?.length ? (
          <div className="guest-list">
            {report.conflictos.map((conflict, index) => (
              <div className="guest-item" key={index}>
                <div>
                  <strong>{conflict.solicitud.codigoApartamento}</strong>
                  <span>{conflict.solicitud.entrada} → {conflict.solicitud.salida}</span>
                </div>
                <span className="state-label">{conflict.motivo}</span>
                <span>{conflict.fecha?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">Sin conflictos de canal registrados.</div>}
      </div>
    </section>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}
