import type { LeadStatus } from '../modules/leads/api'

interface StatusBadgeProps {
  status: LeadStatus
  className?: string
}

const statusLabelMap: Record<LeadStatus, string> = {
  NEW: 'Novo',
  CONTACTED: 'Em contato',
  WON: 'Ganho',
  LOST: 'Perdido'
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge-${status.toLowerCase()} ${className ?? ''}`.trim()}>
      {statusLabelMap[status]}
    </span>
  )
}
