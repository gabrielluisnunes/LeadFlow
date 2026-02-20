import type { LeadStatus } from '../../../../modules/leads/api'

interface LeadStatusBadgeProps {
  status: LeadStatus
}

const labelMap: Record<LeadStatus, string> = {
  NEW: 'Novo',
  CONTACTED: 'Em contato',
  WON: 'Convertido',
  LOST: 'Perdido'
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return (
    <span className={`lead-status-pill lead-status-${status.toLowerCase()}`}>
      {labelMap[status]}
    </span>
  )
}
