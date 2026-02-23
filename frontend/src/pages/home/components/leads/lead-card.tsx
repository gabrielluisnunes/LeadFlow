import type { ReactNode } from 'react'
import type { Lead, LeadStatus } from '../../../../modules/leads/api'
import { StatusBadge } from '../../../../components/status-badge'

interface LeadCardProps {
  lead: Lead
  isExpanded: boolean
  isUpdatingStatusId: string | null
  onToggle: (leadId: string) => void
  onUpdateStatus: (leadId: string, status: LeadStatus) => void
  formatLeadDate: (value: string) => string
  formatPhoneForDisplay: (value: string) => string
  children?: ReactNode
}

const leadStatusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST']

const labelMap: Record<LeadStatus, string> = {
  NEW: 'Novo',
  CONTACTED: 'Em contato',
  WON: 'Convertido',
  LOST: 'Perdido'
}

export function LeadCard({
  lead,
  isExpanded,
  isUpdatingStatusId,
  onToggle,
  onUpdateStatus,
  formatLeadDate,
  formatPhoneForDisplay,
  children
}: LeadCardProps) {
  return (
    <li className={`lead-v2-item ${isExpanded ? 'expanded' : ''}`}>
      <div className="lead-v2-main">
        <button type="button" className="lead-v2-open" onClick={() => onToggle(lead.id)}>
          <div className="lead-v2-identity">
            <div className="lead-v2-name-row">
              <h4>{lead.name}</h4>
              <StatusBadge status={lead.status} />
            </div>
            <p>{formatPhoneForDisplay(lead.phone)}</p>
            <small>{lead.email || 'Email não informado'}</small>
          </div>
        </button>

        <div className="lead-v2-right">
          <button type="button" className="lead-v2-open-action" onClick={() => onToggle(lead.id)}>
            {isExpanded ? 'Fechar' : 'Abrir'}
          </button>
          <small className="lead-v2-date">{formatLeadDate(lead.createdAt)}</small>
        </div>
      </div>

      <div className="lead-v2-meta">
        <span className="lead-v2-origin-badge">{lead.source || 'Origem não informada'}</span>

        <label className="lead-v2-status-field">
          Status
          <select
            value={lead.status}
            onChange={(event) => {
              const nextStatus = event.target.value as LeadStatus

              console.log('[LeadFlow] status select changed', {
                leadId: lead.id,
                previousStatus: lead.status,
                nextStatus
              })

              onUpdateStatus(lead.id, nextStatus)
            }}
            disabled={isUpdatingStatusId === lead.id}
          >
            {leadStatusOptions.map((option) => (
              <option key={option} value={option}>
                {labelMap[option]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isExpanded ? <section className="lead-v2-expanded">{children}</section> : null}
    </li>
  )
}
