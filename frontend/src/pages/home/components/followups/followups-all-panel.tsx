import type { FollowUpWithLead } from '../../../../modules/followups/api'
import type { FollowUpAction } from './types'

interface FollowUpsAllPanelProps {
  followUps: FollowUpWithLead[]
  isLoadingFollowUps: boolean
  followUpErrorMessage: string
  activeFollowUpAction: { followUpId: string; action: FollowUpAction } | null
  onMarkFollowUpAsDone: (followUpId: string) => void
  onRescheduleFollowUp: (followUpId: string, currentScheduledAt: string) => void
  onCancelFollowUp: (followUpId: string) => void
  onRefreshAgenda: () => void
  formatDateTime: (value: string) => string
}

export function FollowUpsAllPanel({
  followUps,
  isLoadingFollowUps,
  followUpErrorMessage,
  activeFollowUpAction,
  onMarkFollowUpAsDone,
  onRescheduleFollowUp,
  onCancelFollowUp,
  onRefreshAgenda,
  formatDateTime
}: FollowUpsAllPanelProps) {
  function getPriorityLabel(priority: string) {
    if (priority === 'HIGH') {
      return 'Alta'
    }

    if (priority === 'LOW') {
      return 'Baixa'
    }

    return 'Média'
  }

  function getStatusLabel(status: string) {
    if (status === 'DONE') {
      return 'Concluído'
    }

    if (status === 'CANCELED') {
      return 'Cancelado'
    }

    return 'Pendente'
  }

  return (
    <section className="followups-panel followups-all-panel">
      <header className="followups-panel-header followups-panel-header-inline">
        <div>
          <h2>Todos os follow-ups</h2>
          <p>Visualize e edite follow-ups concluídos, cancelados e pendentes em um só lugar.</p>
        </div>

        <button
          type="button"
          className="followups-refresh"
          onClick={onRefreshAgenda}
          disabled={isLoadingFollowUps}
        >
          Atualizar lista
        </button>
      </header>

      {isLoadingFollowUps ? <p>Carregando follow-ups...</p> : null}
      {!isLoadingFollowUps && followUpErrorMessage ? (
        <p className="form-error">{followUpErrorMessage}</p>
      ) : null}

      {!isLoadingFollowUps && !followUpErrorMessage ? (
        followUps.length > 0 ? (
          <ul className="followups-all-list">
            {followUps.map((followUp) => {
              const isPending = followUp.status === 'PENDING'

              return (
                <li key={followUp.id} className="followups-all-item">
                  <div className="followups-all-item-head">
                    <strong>{followUp.title}</strong>
                    <span className={`followups-status followups-status-${followUp.status.toLowerCase()}`}>
                      {getStatusLabel(followUp.status)}
                    </span>
                  </div>

                  <small>
                    Lead: {followUp.lead.name} · Agendado: {formatDateTime(followUp.scheduledAt)}
                  </small>

                  <div className="followups-item-badges">
                    <span className={`followups-priority followups-priority-${followUp.priority.toLowerCase()}`}>
                      Prioridade {getPriorityLabel(followUp.priority)}
                    </span>
                  </div>

                  {followUp.notes ? <p className="followups-notes">{followUp.notes}</p> : null}

                  {followUp.status === 'DONE' && followUp.doneAt ? (
                    <small className="followups-all-meta">Concluído em: {formatDateTime(followUp.doneAt)}</small>
                  ) : null}

                  {followUp.status === 'CANCELED' && followUp.canceledAt ? (
                    <small className="followups-all-meta">Cancelado em: {formatDateTime(followUp.canceledAt)}</small>
                  ) : null}

                  {isPending ? (
                    <div className="followups-all-item-actions">
                      <button
                        type="button"
                        className="followups-item-action followups-item-action-success"
                        onClick={() => onMarkFollowUpAsDone(followUp.id)}
                        disabled={
                          activeFollowUpAction?.followUpId === followUp.id &&
                          activeFollowUpAction?.action === 'done'
                        }
                      >
                        {activeFollowUpAction?.followUpId === followUp.id &&
                        activeFollowUpAction?.action === 'done'
                          ? 'Concluindo...'
                          : 'Concluir'}
                      </button>

                      <button
                        type="button"
                        className="followups-item-action"
                        onClick={() => onRescheduleFollowUp(followUp.id, followUp.scheduledAt)}
                        disabled={
                          activeFollowUpAction?.followUpId === followUp.id &&
                          activeFollowUpAction?.action === 'reschedule'
                        }
                      >
                        {activeFollowUpAction?.followUpId === followUp.id &&
                        activeFollowUpAction?.action === 'reschedule'
                          ? 'Reagendando...'
                          : 'Reagendar +1d'}
                      </button>

                      <button
                        type="button"
                        className="followups-item-action followups-item-action-danger"
                        onClick={() => onCancelFollowUp(followUp.id)}
                        disabled={
                          activeFollowUpAction?.followUpId === followUp.id &&
                          activeFollowUpAction?.action === 'cancel'
                        }
                      >
                        {activeFollowUpAction?.followUpId === followUp.id &&
                        activeFollowUpAction?.action === 'cancel'
                          ? 'Cancelando...'
                          : 'Cancelar'}
                      </button>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="followups-empty">Nenhum follow-up cadastrado.</p>
        )
      ) : null}
    </section>
  )
}
