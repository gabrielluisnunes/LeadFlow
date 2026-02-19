import type { FormEvent } from 'react'
import type { Lead, LeadStatus } from '../../../modules/leads/api'

const leadStatusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST']

interface LeadFormData {
  name: string
  phone: string
  email: string
  source: string
}

interface LeadsSectionProps {
  formData: LeadFormData
  isCreating: boolean
  createErrorMessage: string
  onCreateLead: (event: FormEvent<HTMLFormElement>) => void
  onLeadFieldChange: (field: keyof LeadFormData, value: string) => void
  leads: Lead[]
  isLoading: boolean
  errorMessage: string
  statusErrorMessage: string
  isUpdatingStatusId: string | null
  onUpdateStatus: (leadId: string, status: LeadStatus) => void
  onRefreshLeads: () => void
}

export function LeadsSection({
  formData,
  isCreating,
  createErrorMessage,
  onCreateLead,
  onLeadFieldChange,
  leads,
  isLoading,
  errorMessage,
  statusErrorMessage,
  isUpdatingStatusId,
  onUpdateStatus,
  onRefreshLeads
}: LeadsSectionProps) {
  return (
    <>
      <section className="list-section">
        <h2>Novo lead</h2>

        <form className="auth-form" onSubmit={onCreateLead}>
          <label>
            Nome
            <input
              type="text"
              value={formData.name}
              onChange={(event) => onLeadFieldChange('name', event.target.value)}
              minLength={3}
              required
            />
          </label>

          <label>
            Telefone
            <input
              type="text"
              value={formData.phone}
              onChange={(event) => onLeadFieldChange('phone', event.target.value)}
              minLength={10}
              maxLength={11}
              required
            />
          </label>

          <label>
            Email (opcional)
            <input
              type="email"
              value={formData.email}
              onChange={(event) => onLeadFieldChange('email', event.target.value)}
            />
          </label>

          <label>
            Origem (opcional)
            <input
              type="text"
              value={formData.source}
              onChange={(event) => onLeadFieldChange('source', event.target.value)}
            />
          </label>

          {createErrorMessage ? <p className="form-error">{createErrorMessage}</p> : null}

          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Salvando...' : 'Criar lead'}
          </button>
        </form>
      </section>

      <section className="list-section">
        <h2>Leads</h2>

        {isLoading ? <p>Carregando leads...</p> : null}

        {!isLoading && errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {!isLoading && !errorMessage && statusErrorMessage ? (
          <p className="form-error">{statusErrorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage ? (
          leads.length > 0 ? (
            <ul className="lead-list">
              {leads.map((lead) => (
                <li key={lead.id} className="lead-item">
                  <div>
                    <strong>{lead.name}</strong> — {lead.phone}
                  </div>

                  <label className="status-field">
                    Status
                    <select
                      value={lead.status}
                      onChange={(event) =>
                        onUpdateStatus(lead.id, event.target.value as LeadStatus)
                      }
                      disabled={isUpdatingStatusId === lead.id}
                    >
                      {leadStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum lead cadastrado.</p>
          )
        ) : null}

        <button type="button" onClick={onRefreshLeads} disabled={isLoading}>
          Atualizar leads
        </button>
      </section>
    </>
  )
}
