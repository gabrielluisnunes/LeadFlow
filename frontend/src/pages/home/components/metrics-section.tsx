import type { LeadsOverviewMetrics } from '../../../modules/metrics/api'

interface MetricsSectionProps {
  isLoading: boolean
  errorMessage: string
  metrics: LeadsOverviewMetrics | null
  onRefresh: () => void
}

export function MetricsSection({
  isLoading,
  errorMessage,
  metrics,
  onRefresh
}: MetricsSectionProps) {
  return (
    <section className="list-section">
      <h2 className="title-with-emoji">
        <span className="title-emoji" aria-hidden="true">
          📊
        </span>
        <span>Métricas</span>
      </h2>

      {isLoading ? <p>Carregando métricas...</p> : null}
      {!isLoading && errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {!isLoading && !errorMessage && metrics ? (
        <div className="metrics-grid">
          <div className="metric-card">
            <span>Total de leads</span>
            <strong>{metrics.totalLeads}</strong>
          </div>
          <div className="metric-card">
            <span>Taxa de conversão</span>
            <strong>{metrics.conversaionRate}%</strong>
          </div>
          <div className="metric-card">
            <span>NEW</span>
            <strong>{metrics.byStatus.NEW}</strong>
          </div>
          <div className="metric-card">
            <span>CONTACTED</span>
            <strong>{metrics.byStatus.CONTACTED}</strong>
          </div>
          <div className="metric-card">
            <span>WON</span>
            <strong>{metrics.byStatus.WON}</strong>
          </div>
          <div className="metric-card">
            <span>LOST</span>
            <strong>{metrics.byStatus.LOST}</strong>
          </div>
        </div>
      ) : null}

      <button type="button" onClick={onRefresh} disabled={isLoading}>
        Atualizar métricas
      </button>
    </section>
  )
}
