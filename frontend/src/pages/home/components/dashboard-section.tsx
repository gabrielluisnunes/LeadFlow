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

  const statusSource =
    metrics?.byStatus ??
    leads.reduce(
      (accumulator, lead) => {
        accumulator[lead.status] += 1
        return accumulator
      },
      {
        NEW: 0,
        CONTACTED: 0,
        WON: 0,
        LOST: 0
      }
    )

  const totalLeads = metrics?.totalLeads ?? leads.length
  const conversionRate =
    metrics?.conversaionRate ??
    (totalLeads > 0 ? Number(((statusSource.WON / totalLeads) * 100).toFixed(1)) : 0)

  const statusPieData = [
    { name: 'Novos', value: statusSource.NEW },
    { name: 'Em contato', value: statusSource.CONTACTED },
    { name: 'Convertidos', value: statusSource.WON },
    { name: 'Perdidos', value: statusSource.LOST }
  ]

  const hasPieData = statusPieData.some((item) => item.value > 0)
  const pieFallbackData = hasPieData ? statusPieData : [{ name: 'Sem dados', value: 1 }]

  return (
    <section className="dashboard-analytics">
      <div className="dashboard-analytics-header">
        <div>
          <h2>📊 Visão do funil</h2>
          <p>Acompanhe evolução mensal e distribuição por status em tempo real.</p>
        </div>

        <button type="button" className="dashboard-analytics-refresh" onClick={onRefresh}>
          Atualizar dashboard
        </button>
      </div>

      {isLoading ? <p>Carregando dashboard...</p> : null}
      {!isLoading && errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {!isLoading && !errorMessage ? (
        <>
          <div className="dashboard-analytics-kpis">
            <article className="dashboard-analytics-kpi">
              <small>🚀 Total de leads</small>
              <strong>{totalLeads}</strong>
            </article>
            <article className="dashboard-analytics-kpi">
              <small>🎯 Taxa de conversão</small>
              <strong>{conversionRate}%</strong>
            </article>
            <article className="dashboard-analytics-kpi">
              <small>💬 Em contato</small>
              <strong>{statusSource.CONTACTED}</strong>
            </article>
            <article className="dashboard-analytics-kpi">
              <small>🏆 Convertidos</small>
              <strong>{statusSource.WON}</strong>
            </article>
          </div>

          <div className="dashboard-analytics-grid">
            <article className="dashboard-chart-card">
              <h3>📈 Leads por mês</h3>
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
              <h3>🥧 Distribuição por status</h3>
              <div className="dashboard-chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieFallbackData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={86}
                      paddingAngle={2}
                    >
                      {pieFallbackData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={hasPieData ? pieColors[index % pieColors.length] : '#d7dced'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {!hasPieData ? (
                  <p className="dashboard-empty">Sem dados reais ainda — este gráfico será preenchido.</p>
                ) : null}
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
