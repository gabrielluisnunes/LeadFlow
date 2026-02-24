import type { FollowUpGroup } from './types'
import type { FollowUpAction } from './types'

interface FollowUpsAgendaPanelProps {
  groups: FollowUpGroup[]
  isLoadingFollowUps: boolean
  followUpErrorMessage: string
  activeFollowUpAction: { followUpId: string; action: FollowUpAction } | null
  onMarkFollowUpAsDone: (followUpId: string) => void
  onRescheduleFollowUp: (followUpId: string, currentScheduledAt: string) => void
  onCancelFollowUp: (followUpId: string) => void
  onRefreshAgenda: () => void
  formatDateTime: (value: string) => string
}

export function FollowUpsAgendaPanel({
  groups,
  isLoadingFollowUps,
  followUpErrorMessage,
  activeFollowUpAction,
  onMarkFollowUpAsDone,
  onRescheduleFollowUp,
  onCancelFollowUp,
  onRefreshAgenda,
  formatDateTime
}: FollowUpsAgendaPanelProps) {
  function getPriorityLabel(priority: string) {
    if (priority === 'HIGH') {
      return 'Alta'
    }

    if (priority === 'LOW') {
      return 'Baixa'
    }

    return 'Média'
  }

  return (
    <section className="followups-panel">
      <header className="followups-panel-header followups-panel-header-inline">
        <div>
          <h2>Agenda de follow-ups</h2>
          <p>Visualize compromissos de hoje, atrasados e próximos 7 dias.</p>
        </div>

        <button
          type="button"
          className="followups-refresh"
          onClick={onRefreshAgenda}
          disabled={isLoadingFollowUps}
        >
          Atualizar agenda
        </button>
      </header>

      {isLoadingFollowUps ? <p>Carregando agenda...</p> : null}
      {!isLoadingFollowUps && followUpErrorMessage ? (
        <p className="form-error">{followUpErrorMessage}</p>
      ) : null}

      {!isLoadingFollowUps && !followUpErrorMessage ? (
        <div className="followups-groups-grid">
          {groups.map((group) => (
            <article key={group.key} className="followups-group-card">
              <h3>{group.title}</h3>

              {group.items.length > 0 ? (
                <ul className="followups-list">
                  {group.items.map((followUp) => (
                    <li key={followUp.id} className="followups-item">
                      <div className="followups-item-meta">
                        <strong>{followUp.title}</strong>
                        <small>
                          Lead: {followUp.lead.name} · {formatDateTime(followUp.scheduledAt)}
                        </small>

                        <div className="followups-item-badges">
                          <span className={`followups-priority followups-priority-${followUp.priority.toLowerCase()}`}>
                            Prioridade {getPriorityLabel(followUp.priority)}
                          </span>
                        </div>

                        {followUp.notes ? <p className="followups-notes">{followUp.notes}</p> : null}
                      </div>

                      <div className="followups-item-actions">
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="followups-empty">{group.emptyMessage}</p>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
