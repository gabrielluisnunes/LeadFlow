import type { LeadStatus } from '../../../../modules/leads/api'
import { BadgeCheck, CircleUserRound, Handshake, Users } from 'lucide-react'

interface MetricsCardsProps {
  total: number
  byStatus: Record<LeadStatus, number>
}

export function MetricsCards({ total, byStatus }: MetricsCardsProps) {
  return (
    <section className="leads-v2-kpis" aria-label="Resumo de leads">
      <article className="leads-v2-kpi-card">
        <div className="leads-v2-kpi-label">
          <small>Total</small>
          <Users size={16} />
        </div>
        <strong>{total}</strong>
      </article>
      <article className="leads-v2-kpi-card">
        <div className="leads-v2-kpi-label">
          <small>Novos</small>
          <CircleUserRound size={16} />
        </div>
        <strong>{byStatus.NEW}</strong>
      </article>
      <article className="leads-v2-kpi-card">
        <div className="leads-v2-kpi-label">
          <small>Em contato</small>
          <Handshake size={16} />
        </div>
        <strong>{byStatus.CONTACTED}</strong>
      </article>
      <article className="leads-v2-kpi-card">
        <div className="leads-v2-kpi-label">
          <small>Convertidos</small>
          <BadgeCheck size={16} />
        </div>
        <strong>{byStatus.WON}</strong>
      </article>
    </section>
  )
}
