import type { Activity } from '../../../modules/activities/api'

interface ActivitiesSectionProps {
  isLoadingActivities: boolean
  activitiesErrorMessage: string
  activities: Activity[]
  onRefreshActivities: () => void
  formatDateTime: (value: string) => string
}

function getActivityLabel(activity: Activity) {
  switch (activity.type) {
    case 'LEAD_CREATED':
      return 'Lead criado'
    case 'LEAD_STATUS_UPDATED':
      return 'Status do lead atualizado'
    case 'FOLLOWUP_CREATED':
      return 'Follow-up criado'
    case 'FOLLOWUP_DONE':
      return 'Follow-up concluído'
    default:
      return activity.type
  }
}

export function ActivitiesSection({
  isLoadingActivities,
  activitiesErrorMessage,
  activities,
  onRefreshActivities,
  formatDateTime
}: ActivitiesSectionProps) {
  return (
    <section className="list-section">
      <h2 className="title-with-emoji">
        <span className="title-emoji" aria-hidden="true">
          📝
        </span>
        <span>Atividades</span>
      </h2>

      {isLoadingActivities ? <p>Carregando atividades...</p> : null}
      {!isLoadingActivities && activitiesErrorMessage ? (
        <p className="form-error">{activitiesErrorMessage}</p>
      ) : null}

      {!isLoadingActivities && !activitiesErrorMessage ? (
        activities.length > 0 ? (
          <ul className="activity-list">
            {activities.map((activity) => (
              <li key={activity.id} className="activity-item">
                <strong>{getActivityLabel(activity)}</strong>
                <div className="activity-meta">
                  <span>{formatDateTime(activity.createdAt)}</span>
                  {activity.leadId ? <span>Lead: {activity.leadId}</span> : null}
                  {activity.followUpId ? <span>Follow-up: {activity.followUpId}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma atividade registrada.</p>
        )
      ) : null}

      <button type="button" onClick={onRefreshActivities} disabled={isLoadingActivities}>
        Atualizar atividades
      </button>
    </section>
  )
}
