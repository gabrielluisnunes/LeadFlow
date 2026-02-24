import type { FollowUpGroup } from './types'

interface FollowUpsAgendaPanelProps {
  groups: FollowUpGroup[]
  isLoadingFollowUps: boolean
  followUpErrorMessage: string
  isMarkingDoneId: string | null
  onMarkFollowUpAsDone: (followUpId: string) => void
  onRefreshAgenda: () => void
  formatDateTime: (value: string) => string
}

export function FollowUpsAgendaPanel({
  groups,
  isLoadingFollowUps,
  followUpErrorMessage,
  isMarkingDoneId,
  onMarkFollowUpAsDone,
  onRefreshAgenda,
  formatDateTime
}: FollowUpsAgendaPanelProps) {
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
                        <strong>{followUp.lead.name}</strong>
                        <small>{formatDateTime(followUp.scheduledAt)}</small>
                      </div>

                      <button
                        type="button"
                        className="followups-item-action"
                        onClick={() => onMarkFollowUpAsDone(followUp.id)}
                        disabled={isMarkingDoneId === followUp.id}
                      >
                        {isMarkingDoneId === followUp.id ? 'Concluindo...' : 'Concluir'}
                      </button>
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
