import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { Lead, LeadStatus } from '../../../modules/leads/api'
import type { LeadsOverviewMetrics } from '../../../modules/metrics/api'

interface DashboardSectionProps {
  leads: Lead[]
  metrics: LeadsOverviewMetrics | null
  isLoading: boolean
  errorMessage: string
  onRefresh: () => void
}

const pieColors = ['#3b6df6', '#6f8ef8', '#29b36f', '#f06a63']
type MonthlyChartType = 'bar' | 'line' | 'area'

const statusLabelMap: Record<LeadStatus, string> = {
  NEW: 'Novo',
  CONTACTED: 'Em contato',
  WON: 'Ganho',
  LOST: 'Perdido'
}

export function DashboardSection({
  leads,
  metrics,
  isLoading,
  errorMessage,
  onRefresh
}: DashboardSectionProps) {
  const [monthlyChartType, setMonthlyChartType] = useState<MonthlyChartType>('bar')
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

  const statusPieData: Array<{ key: LeadStatus; name: string; value: number }> = [
    { key: 'NEW', name: 'Novos', value: statusSource.NEW },
    { key: 'CONTACTED', name: 'Em contato', value: statusSource.CONTACTED },
    { key: 'WON', name: 'Convertidos', value: statusSource.WON },
    { key: 'LOST', name: 'Perdidos', value: statusSource.LOST }
  ]

  const hasPieData = statusPieData.some((item) => item.value > 0)
  const pieFallbackData = hasPieData
    ? statusPieData
    : [{ key: 'NEW' as LeadStatus, name: 'Sem dados', value: 1 }]

  const pieLegendData = statusPieData.map((item, index) => ({
    ...item,
    color: pieColors[index % pieColors.length],
    percent: totalLeads > 0 ? Math.round((item.value / totalLeads) * 100) : 0
  }))

  return (
    <section className="dashboard-analytics">
      <div className="dashboard-analytics-header">
        <div>
          <h2>Visão do funil</h2>
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
              <small className="label-with-emoji">
                <span className="title-emoji" aria-hidden="true">
                  🚀
                </span>
                <span>Total de leads</span>
              </small>
              <strong>{totalLeads}</strong>
            </article>
            <article className="dashboard-analytics-kpi">
              <small className="label-with-emoji">
                <span className="title-emoji" aria-hidden="true">
                  🎯
                </span>
                <span>Taxa de conversão</span>
              </small>
              <strong>{conversionRate}%</strong>
            </article>
            <article className="dashboard-analytics-kpi">
              <small className="label-with-emoji">
                <span className="title-emoji" aria-hidden="true">
                  💬
                </span>
                <span>Em contato</span>
              </small>
              <strong>{statusSource.CONTACTED}</strong>
            </article>
            <article className="dashboard-analytics-kpi">
              <small className="label-with-emoji">
                <span className="title-emoji" aria-hidden="true">
                  🏆
                </span>
                <span>Convertidos</span>
              </small>
              <strong>{statusSource.WON}</strong>
            </article>
          </div>

          <div className="dashboard-analytics-grid">
            <article className="dashboard-chart-card">
              <div className="dashboard-chart-head">
                <h3>Leads por mês</h3>
                <div className="dashboard-chart-switch" role="tablist" aria-label="Tipo de gráfico mensal">
                  <button
                    type="button"
                    className={monthlyChartType === 'bar' ? 'active' : ''}
                    onClick={() => setMonthlyChartType('bar')}
                  >
                    Barras
                  </button>
                  <button
                    type="button"
                    className={monthlyChartType === 'line' ? 'active' : ''}
                    onClick={() => setMonthlyChartType('line')}
                  >
                    Linha
                  </button>
                  <button
                    type="button"
                    className={monthlyChartType === 'area' ? 'active' : ''}
                    onClick={() => setMonthlyChartType('area')}
                  >
                    Área
                  </button>
                </div>
              </div>

              <div className="dashboard-chart-area">
                {monthlyChartType === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyLeadsData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f5" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => [`${value} lead(s)`, 'Total']} />
                      <Bar dataKey="total" fill="#3b6df6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}

                {monthlyChartType === 'line' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyLeadsData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f5" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => [`${value} lead(s)`, 'Total']} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#3b6df6"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#3b6df6' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : null}

                {monthlyChartType === 'area' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyLeadsData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f5" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => [`${value} lead(s)`, 'Total']} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#3b6df6"
                        fill="#dfe8ff"
                        strokeWidth={2.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </article>

            <article className="dashboard-chart-card">
              <h3>Distribuição por status</h3>
              <div className="dashboard-chart-area dashboard-chart-area-status">
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
                    <Tooltip formatter={(value, name) => [`${value} lead(s)`, `${name}`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {!hasPieData ? (
                <p className="dashboard-empty-note">Sem dados reais ainda — este gráfico será preenchido.</p>
              ) : null}

              <ul className="dashboard-status-legend">
                {pieLegendData.map((item) => (
                  <li key={item.name}>
                    <span style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <div className="dashboard-legend-content">
                      <span className="dashboard-status-label">{statusLabelMap[item.key]}</span>
                      <small>{item.percent}% do total</small>
                    </div>
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
