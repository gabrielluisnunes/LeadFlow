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
  const totalLeads = metrics?.totalLeads ?? 0
  const conversionRate = metrics?.conversaionRate ?? 0

  const statusData = [
    { key: 'NEW', label: 'Novos', emoji: '🆕', value: metrics?.byStatus.NEW ?? 0 },
    {
      key: 'CONTACTED',
      label: 'Em contato',
      emoji: '💬',
      value: metrics?.byStatus.CONTACTED ?? 0
    },
    { key: 'WON', label: 'Convertidos', emoji: '🏆', value: metrics?.byStatus.WON ?? 0 },
    { key: 'LOST', label: 'Perdidos', emoji: '📉', value: metrics?.byStatus.LOST ?? 0 }
  ]

  const bestStatus = statusData.reduce((best, current) =>
    current.value > best.value ? current : best
  )

  return (
    <section className="metrics-page">
      <header className="metrics-header">
        <div>
          <h2 className="title-with-emoji">
            <span className="title-emoji" aria-hidden="true">
              📊
            </span>
            <span>Métricas</span>
          </h2>
          <p>Painel de desempenho do funil com leitura rápida para tomada de decisão.</p>
        </div>

        <button type="button" className="metrics-refresh" onClick={onRefresh} disabled={isLoading}>
          Atualizar métricas
        </button>
      </header>

      {isLoading ? <p>Carregando métricas...</p> : null}
      {!isLoading && errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {!isLoading && !errorMessage && metrics ? (
        <>
          <section className="metrics-kpi-grid" aria-label="Principais indicadores">
            <article className="metrics-kpi-card">
              <small>🚀 Total de leads</small>
              <strong>{totalLeads}</strong>
            </article>

            <article className="metrics-kpi-card">
              <small>🎯 Taxa de conversão</small>
              <strong>{conversionRate}%</strong>
            </article>

            <article className="metrics-kpi-card">
              <small>🏅 Maior volume</small>
              <strong>{bestStatus.label}</strong>
            </article>

            <article className="metrics-kpi-card">
              <small>⚖️ Perdas</small>
              <strong>{metrics.byStatus.LOST}</strong>
            </article>
          </section>

          <section className="metrics-distribution" aria-label="Distribuição por status">
            <h3 className="title-with-emoji">
              <span className="title-emoji" aria-hidden="true">
                🧭
              </span>
              <span>Distribuição por status</span>
            </h3>

            <div className="metrics-status-list">
              {statusData.map((status) => {
                const percentage = totalLeads > 0 ? Math.round((status.value / totalLeads) * 100) : 0

                return (
                  <article className="metrics-status-item" key={status.key}>
                    <div className="metrics-status-header">
                      <span>
                        {status.emoji} {status.label}
                      </span>
                      <strong>
                        {status.value} ({percentage}%)
                      </strong>
                    </div>

                    <div className="metrics-progress-track" role="presentation">
                      <span className="metrics-progress-fill" style={{ width: `${percentage}%` }} />
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="metrics-insights" aria-label="Insights rápidos">
            <article className="metrics-insight-card">
              <h4>📌 Leitura rápida</h4>
              <p>
                Você possui <strong>{metrics.byStatus.CONTACTED}</strong> leads em contato e{' '}
                <strong>{metrics.byStatus.WON}</strong> já convertidos.
              </p>
            </article>

            <article className="metrics-insight-card">
              <h4>💡 Próxima ação</h4>
              <p>
                Priorize os leads em contato para aumentar a taxa de conversão acima dos atuais{' '}
                <strong>{conversionRate}%</strong>.
              </p>
            </article>
          </section>
        </>
      ) : null}
    </section>
  )
}
