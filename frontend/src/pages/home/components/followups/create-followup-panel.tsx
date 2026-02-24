import type { FormEvent } from 'react'
import type { Lead } from '../../../../modules/leads/api'
import { maskDateBRInput } from '../../../../lib/format-date-br'
import type { FollowUpFormData } from './types'

interface CreateFollowUpPanelProps {
  formData: FollowUpFormData
  leads: Lead[]
  isCreatingFollowUp: boolean
  createFollowUpErrorMessage: string
  onCreateFollowUp: (event: FormEvent<HTMLFormElement>) => void
  onFollowUpFieldChange: (field: keyof FollowUpFormData, value: string) => void
}

export function CreateFollowUpPanel({
  formData,
  leads,
  isCreatingFollowUp,
  createFollowUpErrorMessage,
  onCreateFollowUp,
  onFollowUpFieldChange
}: CreateFollowUpPanelProps) {
  return (
    <section className="followups-panel">
      <header className="followups-panel-header">
        <h2>Novo follow-up</h2>
        <p>Agende um próximo contato para não perder oportunidades.</p>
      </header>

      <form className="auth-form followups-form" onSubmit={onCreateFollowUp}>
        <label>
          Lead
          <select
            value={formData.leadId}
            onChange={(event) => onFollowUpFieldChange('leadId', event.target.value)}
            required
          >
            <option value="">Selecione um lead</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Data
          <input
            type="text"
            value={formData.scheduledAt}
            onChange={(event) =>
              onFollowUpFieldChange('scheduledAt', maskDateBRInput(event.target.value))
            }
            inputMode="numeric"
            maxLength={10}
            placeholder="dd/mm/aaaa"
            required
          />
        </label>

        {createFollowUpErrorMessage ? <p className="form-error">{createFollowUpErrorMessage}</p> : null}

        <button type="submit" className="followups-primary-action" disabled={isCreatingFollowUp || leads.length === 0}>
          {isCreatingFollowUp ? 'Salvando...' : 'Criar follow-up'}
        </button>
      </form>
    </section>
  )
}
