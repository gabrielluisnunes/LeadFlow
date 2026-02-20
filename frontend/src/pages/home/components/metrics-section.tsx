import { useMemo, useState } from 'react'
import type { Lead, LeadStatus } from '../../../modules/leads/api'
import type { LeadsOverviewMetrics } from '../../../modules/metrics/api'
import { StatusBadge } from '../../../components/status-badge'

type PeriodFilter = '7d' | '30d' | '90d' | 'all'

interface MetricsSectionProps {
  isLoading: boolean
  errorMessage: string
  metrics: LeadsOverviewMetrics | null
  leads: Lead[]
  onRefresh: () => void
}

export function MetricsSection({
  isLoading,
  errorMessage,
  metrics,
  leads,
  onRefresh
}: MetricsSectionProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d')

  const filteredLeads = useMemo(() => {
    if (periodFilter === 'all') {
      return leads
    }

    const days = Number(periodFilter.replace('d', ''))
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - (days - 1))

    return leads.filter((lead) => new Date(lead.createdAt) >= startDate)
  }, [leads, periodFilter])

  const leadsByStatus = useMemo(() => {
    return filteredLeads.reduce(
      (accumulator, lead) => {
        accumulator[lead.status] += 1
        return accumulator
      },
      {
        NEW: 0,
        CONTACTED: 0,
        WON: 0,
        LOST: 0
      } satisfies Record<LeadStatus, number>
    )
  }, [filteredLeads])

  const totalLeads = periodFilter === 'all' && metrics ? metrics.totalLeads : filteredLeads.length

  const conversionRate =
    periodFilter === 'all' && metrics
      ? metrics.conversaionRate
      : totalLeads > 0
        ? Number(((leadsByStatus.WON / totalLeads) * 100).toFixed(1))
        : 0

  const statusData = [
    {
      key: 'NEW' as LeadStatus,
      label: 'Novos',
      value: periodFilter === 'all' && metrics ? metrics.byStatus.NEW : leadsByStatus.NEW
    },
    {
      key: 'CONTACTED' as LeadStatus,
      label: 'Em contato',
      value: periodFilter === 'all' && metrics ? metrics.byStatus.CONTACTED : leadsByStatus.CONTACTED
    },
    {
      key: 'WON' as LeadStatus,
      label: 'Convertidos',
      value: periodFilter === 'all' && metrics ? metrics.byStatus.WON : leadsByStatus.WON
    },
    {
      key: 'LOST' as LeadStatus,
      label: 'Perdidos',
      value: periodFilter === 'all' && metrics ? metrics.byStatus.LOST : leadsByStatus.LOST
    }
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

      <section className="period-filter-group" aria-label="Filtro de período das métricas">
        <button
          type="button"
          className={`period-filter-chip ${periodFilter === '7d' ? 'active' : ''}`}
          onClick={() => setPeriodFilter('7d')}
        >
          Últimos 7 dias
        </button>
        <button
          type="button"
          className={`period-filter-chip ${periodFilter === '30d' ? 'active' : ''}`}
          onClick={() => setPeriodFilter('30d')}
        >
          Últimos 30 dias
        </button>
        <button
          type="button"
          className={`period-filter-chip ${periodFilter === '90d' ? 'active' : ''}`}
          onClick={() => setPeriodFilter('90d')}
        >
          Últimos 90 dias
        </button>
        <button
          type="button"
          className={`period-filter-chip ${periodFilter === 'all' ? 'active' : ''}`}
          onClick={() => setPeriodFilter('all')}
        >
          Todo período
        </button>
      </section>

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
              <strong>{statusData.find((item) => item.key === 'LOST')?.value ?? 0}</strong>
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
                      <StatusBadge status={status.key} />
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
                Você possui <strong>{statusData.find((item) => item.key === 'CONTACTED')?.value ?? 0}</strong>{' '}
                leads em contato e <strong>{statusData.find((item) => item.key === 'WON')?.value ?? 0}</strong>{' '}
                já convertidos.
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
