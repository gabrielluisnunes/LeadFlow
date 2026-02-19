import type { FormEvent } from 'react'
import type { Lead } from '../../../modules/leads/api'
import type { FollowUpWithLead } from '../../../modules/followups/api'

interface FollowUpFormData {
  leadId: string
  scheduledAt: string
}

interface FollowUpsSectionProps {
  formData: FollowUpFormData
  leads: Lead[]
  isCreatingFollowUp: boolean
  createFollowUpErrorMessage: string
  onCreateFollowUp: (event: FormEvent<HTMLFormElement>) => void
  onFollowUpFieldChange: (field: keyof FollowUpFormData, value: string) => void
  isLoadingFollowUps: boolean
  followUpErrorMessage: string
  todayFollowUps: FollowUpWithLead[]
  overdueFollowUps: FollowUpWithLead[]
  upcomingFollowUps: FollowUpWithLead[]
  isMarkingDoneId: string | null
  onMarkFollowUpAsDone: (followUpId: string) => void
  onRefreshAgenda: () => void
  formatDateTime: (value: string) => string
}

export function FollowUpsSection({
  formData,
  leads,
  isCreatingFollowUp,
  createFollowUpErrorMessage,
  onCreateFollowUp,
  onFollowUpFieldChange,
  isLoadingFollowUps,
  followUpErrorMessage,
  todayFollowUps,
  overdueFollowUps,
  upcomingFollowUps,
  isMarkingDoneId,
  onMarkFollowUpAsDone,
  onRefreshAgenda,
  formatDateTime
}: FollowUpsSectionProps) {
  return (
    <>
      <section className="list-section">
        <h2>Novo follow-up</h2>

        <form className="auth-form" onSubmit={onCreateFollowUp}>
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
            Data e hora
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(event) => onFollowUpFieldChange('scheduledAt', event.target.value)}
              required
            />
          </label>

          {createFollowUpErrorMessage ? (
            <p className="form-error">{createFollowUpErrorMessage}</p>
          ) : null}

          <button type="submit" disabled={isCreatingFollowUp || leads.length === 0}>
            {isCreatingFollowUp ? 'Salvando...' : 'Criar follow-up'}
          </button>
        </form>
      </section>

      <section className="list-section">
        <h2>Agenda de follow-ups</h2>

        {isLoadingFollowUps ? <p>Carregando agenda...</p> : null}
        {!isLoadingFollowUps && followUpErrorMessage ? (
          <p className="form-error">{followUpErrorMessage}</p>
        ) : null}

        {!isLoadingFollowUps && !followUpErrorMessage ? (
          <>
            <h3>Hoje</h3>
            {todayFollowUps.length > 0 ? (
              <ul className="followup-list">
                {todayFollowUps.map((followUp) => (
                  <li key={followUp.id} className="followup-item">
                    <div>
                      <strong>{followUp.lead.name}</strong> — {formatDateTime(followUp.scheduledAt)}
                    </div>
                    <button
                      type="button"
                      onClick={() => onMarkFollowUpAsDone(followUp.id)}
                      disabled={isMarkingDoneId === followUp.id}
                    >
                      {isMarkingDoneId === followUp.id ? 'Concluindo...' : 'Concluir'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum follow-up para hoje.</p>
            )}

            <h3>Atrasados</h3>
            {overdueFollowUps.length > 0 ? (
              <ul className="followup-list">
                {overdueFollowUps.map((followUp) => (
                  <li key={followUp.id} className="followup-item">
                    <div>
                      <strong>{followUp.lead.name}</strong> — {formatDateTime(followUp.scheduledAt)}
                    </div>
                    <button
                      type="button"
                      onClick={() => onMarkFollowUpAsDone(followUp.id)}
                      disabled={isMarkingDoneId === followUp.id}
                    >
                      {isMarkingDoneId === followUp.id ? 'Concluindo...' : 'Concluir'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum follow-up atrasado.</p>
            )}

            <h3>Próximos (7 dias)</h3>
            {upcomingFollowUps.length > 0 ? (
              <ul className="followup-list">
                {upcomingFollowUps.map((followUp) => (
                  <li key={followUp.id} className="followup-item">
                    <div>
                      <strong>{followUp.lead.name}</strong> — {formatDateTime(followUp.scheduledAt)}
                    </div>
                    <button
                      type="button"
                      onClick={() => onMarkFollowUpAsDone(followUp.id)}
                      disabled={isMarkingDoneId === followUp.id}
                    >
                      {isMarkingDoneId === followUp.id ? 'Concluindo...' : 'Concluir'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum follow-up próximo.</p>
            )}

            <button type="button" onClick={onRefreshAgenda} disabled={isLoadingFollowUps}>
              Atualizar agenda
            </button>
          </>
        ) : null}
      </section>
    </>
  )
}
