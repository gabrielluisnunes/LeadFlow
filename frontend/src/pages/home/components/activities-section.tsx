import { useMemo, useState } from 'react'
import type { Activity, ActivityType } from '../../../modules/activities/api'
import type { Lead } from '../../../modules/leads/api'

type PeriodFilter = '7d' | '30d' | '90d' | 'all'

interface ActivitiesSectionProps {
  isLoadingActivities: boolean
  activitiesErrorMessage: string
  activities: Activity[]
  leads: Lead[]
  onRefreshActivities: () => void
  formatDateTime: (value: string) => string
}

function getLeadNameFromPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  if ('name' in payload && typeof payload.name === 'string') {
    return payload.name
  }

  return null
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

function getActivityEmoji(type: ActivityType) {
  switch (type) {
    case 'LEAD_CREATED':
      return '🆕'
    case 'LEAD_STATUS_UPDATED':
      return '🔄'
    case 'FOLLOWUP_CREATED':
      return '📅'
    case 'FOLLOWUP_DONE':
      return '✅'
    default:
      return '📝'
  }
}

function getRelativeTimeLabel(dateValue: string) {
  const now = Date.now()
  const createdAt = new Date(dateValue).getTime()
  const diffInMinutes = Math.floor((now - createdAt) / 60000)

  if (diffInMinutes < 1) {
    return 'Agora'
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h atrás`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d atrás`
}

export function ActivitiesSection({
  isLoadingActivities,
  activitiesErrorMessage,
  activities,
  leads,
  onRefreshActivities,
  formatDateTime
}: ActivitiesSectionProps) {
  const [activeFilter, setActiveFilter] = useState<ActivityType | 'ALL'>('ALL')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d')

  const periodFilteredActivities = useMemo(() => {
    if (periodFilter === 'all') {
      return activities
    }

    const days = Number(periodFilter.replace('d', ''))
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - (days - 1))

    return activities.filter((activity) => new Date(activity.createdAt) >= startDate)
  }, [activities, periodFilter])

  const activityCounts = useMemo(() => {
    return periodFilteredActivities.reduce(
      (accumulator, item) => {
        accumulator[item.type] += 1
        return accumulator
      },
      {
        LEAD_CREATED: 0,
        LEAD_STATUS_UPDATED: 0,
        FOLLOWUP_CREATED: 0,
        FOLLOWUP_DONE: 0
      } as Record<ActivityType, number>
    )
  }, [periodFilteredActivities])

  const filteredActivities = useMemo(() => {
    if (activeFilter === 'ALL') {
      return periodFilteredActivities
    }

    return periodFilteredActivities.filter((item) => item.type === activeFilter)
  }, [periodFilteredActivities, activeFilter])

  const leadNameById = useMemo(() => {
    return new Map(leads.map((lead) => [lead.id, lead.name]))
  }, [leads])

  const filterButtons: Array<{
    key: ActivityType | 'ALL'
    label: string
    count: number
    emoji: string
  }> = [
    { key: 'ALL', label: 'Todas', count: periodFilteredActivities.length, emoji: '🗂️' },
    { key: 'LEAD_CREATED', label: 'Leads criados', count: activityCounts.LEAD_CREATED, emoji: '🆕' },
    {
      key: 'LEAD_STATUS_UPDATED',
      label: 'Status alterado',
      count: activityCounts.LEAD_STATUS_UPDATED,
      emoji: '🔄'
    },
    {
      key: 'FOLLOWUP_CREATED',
      label: 'Follow-up criado',
      count: activityCounts.FOLLOWUP_CREATED,
      emoji: '📅'
    },
    { key: 'FOLLOWUP_DONE', label: 'Follow-up concluído', count: activityCounts.FOLLOWUP_DONE, emoji: '✅' }
  ]

  return (
    <section className="activities-page">
      <header className="activities-header">
        <div>
          <p>Monitore tudo que aconteceu no CRM e filtre rapidamente por tipo de ação.</p>
        </div>

        <button
          type="button"
          className="activities-refresh"
          onClick={onRefreshActivities}
          disabled={isLoadingActivities}
        >
          Atualizar atividades
        </button>
      </header>

      <section className="activities-summary-grid" aria-label="Resumo de atividades">
        <article className="activities-summary-card">
          <small>Total</small>
          <strong>{periodFilteredActivities.length}</strong>
        </article>
        <article className="activities-summary-card">
          <small>Leads criados</small>
          <strong>{activityCounts.LEAD_CREATED}</strong>
        </article>
        <article className="activities-summary-card">
          <small>Follow-ups criados</small>
          <strong>{activityCounts.FOLLOWUP_CREATED}</strong>
        </article>
        <article className="activities-summary-card">
          <small>Follow-ups concluídos</small>
          <strong>{activityCounts.FOLLOWUP_DONE}</strong>
        </article>
      </section>

      <section className="period-filter-group" aria-label="Filtro de período das atividades">
        <button
          type="button"
          className={`period-filter-chip ${periodFilter === '7d' ? 'active' : ''}`}
          onClick={() => setPeriodFilter('7d')}
        >
          Últimos 7 dias
        </button>
        <button
          type="button"
          className={`period-filter-chip ${periodFilter === '30d' ? 'active' : ''}`}
          onClick={() => setPeriodFilter('30d')}
        >
          Últimos 30 dias
        </button>
        <button
          type="button"
          className={`period-filter-chip ${periodFilter === '90d' ? 'active' : ''}`}
          onClick={() => setPeriodFilter('90d')}
        >
          Últimos 90 dias
        </button>
        <button
          type="button"
          className={`period-filter-chip ${periodFilter === 'all' ? 'active' : ''}`}
          onClick={() => setPeriodFilter('all')}
        >
          Todo período
        </button>
      </section>

      <section className="activities-filters" aria-label="Filtros de atividades">
        {filterButtons.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`activities-filter-chip ${activeFilter === item.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(item.key)}
          >
            <span className="chip-emoji" aria-hidden="true">
              {item.emoji}
            </span>
            <span>{item.label}</span>
            <strong>{item.count}</strong>
          </button>
        ))}
      </section>

      {isLoadingActivities ? <p>Carregando atividades...</p> : null}
      {!isLoadingActivities && activitiesErrorMessage ? (
        <p className="form-error">{activitiesErrorMessage}</p>
      ) : null}

      {!isLoadingActivities && !activitiesErrorMessage ? (
        filteredActivities.length > 0 ? (
          <ul className="activity-timeline">
            {filteredActivities.map((activity) => (
              <li key={activity.id} className="activity-card">
                <div className="activity-card-main">
                  <span className="activity-card-icon" aria-hidden="true">
                    {getActivityEmoji(activity.type)}
                  </span>
                  <div>
                    <strong>{getActivityLabel(activity)}</strong>
                    <p>{formatDateTime(activity.createdAt)}</p>
                  </div>
                  <small>{getRelativeTimeLabel(activity.createdAt)}</small>
                </div>

                <div className="activity-card-meta">
                  {activity.leadId ? (
                    <span>
                      <strong>Lead:</strong>{' '}
                      {leadNameById.get(activity.leadId) ||
                        getLeadNameFromPayload(activity.payload) ||
                        `${activity.leadId.slice(0, 8)}...`}
                    </span>
                  ) : (
                    <span>
                      <strong>Lead:</strong> —
                    </span>
                  )}

                  {activity.followUpId ? (
                    <span>
                      <strong>Follow-up:</strong> {activity.followUpId.slice(0, 8)}...
                    </span>
                  ) : (
                    <span>
                      <strong>Follow-up:</strong> —
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="activities-empty">Nenhuma atividade encontrada para o filtro selecionado.</p>
        )
      ) : null}
    </section>
  )
}
