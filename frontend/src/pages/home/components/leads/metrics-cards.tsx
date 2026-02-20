import type { LeadStatus } from '../../../../modules/leads/api'

interface MetricsCardsProps {
  total: number
  byStatus: Record<LeadStatus, number>
}

export function MetricsCards({ total, byStatus }: MetricsCardsProps) {
  return (
    <section className="leads-v2-kpis" aria-label="Resumo de leads">
      <article className="leads-v2-kpi-card">
        <small>📁 Total</small>
        <strong>{total}</strong>
      </article>
      <article className="leads-v2-kpi-card">
        <small>🆕 Novos</small>
        <strong>{byStatus.NEW}</strong>
      </article>
      <article className="leads-v2-kpi-card">
        <small>💬 Em contato</small>
        <strong>{byStatus.CONTACTED}</strong>
      </article>
      <article className="leads-v2-kpi-card">
        <small>🏆 Convertidos</small>
        <strong>{byStatus.WON}</strong>
      </article>
    </section>
  )
}
