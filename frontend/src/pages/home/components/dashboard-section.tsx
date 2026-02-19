import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { Lead } from '../../../modules/leads/api'
import type { LeadsOverviewMetrics } from '../../../modules/metrics/api'

interface DashboardSectionProps {
  leads: Lead[]
  metrics: LeadsOverviewMetrics | null
  isLoading: boolean
  errorMessage: string
  onRefresh: () => void
}

const pieColors = ['#3b6df6', '#6f8ef8', '#29b36f', '#f06a63']

export function DashboardSection({
  leads,
  metrics,
  isLoading,
  errorMessage,
  onRefresh
}: DashboardSectionProps) {
  const monthlyLeadsData = buildMonthlyLeads(leads)

  const statusPieData = [
    { name: 'Novos', value: metrics?.byStatus.NEW ?? 0 },
    { name: 'Em contato', value: metrics?.byStatus.CONTACTED ?? 0 },
    { name: 'Convertidos', value: metrics?.byStatus.WON ?? 0 },
    { name: 'Perdidos', value: metrics?.byStatus.LOST ?? 0 }
  ]

  const hasPieData = statusPieData.some((item) => item.value > 0)

  return (
    <section className="dashboard-analytics">
      <div className="dashboard-analytics-header">
        <div>
          <h2>Visão do funil</h2>
          <p>Acompanhe evolução mensal e distribuição por status.</p>
        </div>

        <button type="button" className="dashboard-analytics-refresh" onClick={onRefresh}>
          Atualizar dashboard
        </button>
      </div>

      {isLoading ? <p>Carregando dashboard...</p> : null}
      {!isLoading && errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {!isLoading && !errorMessage && metrics ? (
        <>
          <div className="dashboard-analytics-kpis">
            <article className="dashboard-analytics-kpi">
              <small>Total de leads</small>
              <strong>{metrics.totalLeads}</strong>
            </article>
            <article className="dashboard-analytics-kpi">
              <small>Taxa de conversão</small>
              <strong>{metrics.conversaionRate}%</strong>
            </article>
            <article className="dashboard-analytics-kpi">
              <small>Em contato</small>
              <strong>{metrics.byStatus.CONTACTED}</strong>
            </article>
            <article className="dashboard-analytics-kpi">
              <small>Convertidos</small>
              <strong>{metrics.byStatus.WON}</strong>
            </article>
          </div>

          <div className="dashboard-analytics-grid">
            <article className="dashboard-chart-card">
              <h3>Leads por mês</h3>
              <div className="dashboard-chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyLeadsData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f5" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3b6df6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="dashboard-chart-card">
              <h3>Distribuição por status</h3>
              <div className="dashboard-chart-area">
                {hasPieData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={86}
                        paddingAngle={2}
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="dashboard-empty">Sem dados para exibir no gráfico de pizza.</p>
                )}
              </div>

              <ul className="dashboard-status-legend">
                {statusPieData.map((item, index) => (
                  <li key={item.name}>
                    <span style={{ backgroundColor: pieColors[index % pieColors.length] }} aria-hidden="true" />
                    <small>{item.name}</small>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </>
      ) : null}
    </section>
  )
}

function buildMonthlyLeads(leads: Lead[]) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
  const now = new Date()

  const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: formatter.format(date).replace('.', ''),
      total: 0
    }
  })

  for (const lead of leads) {
    const leadDate = new Date(lead.createdAt)
    const key = `${leadDate.getFullYear()}-${leadDate.getMonth()}`

    const monthBucket = lastSixMonths.find((item) => item.key === key)
    if (monthBucket) {
      monthBucket.total += 1
    }
  }

  return lastSixMonths
}
