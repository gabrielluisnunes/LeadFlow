import type { FormEvent } from 'react'
import type { Lead } from '../../../modules/leads/api'
import type { FollowUpWithLead } from '../../../modules/followups/api'
import { CreateFollowUpPanel } from './followups/create-followup-panel'
import { FollowUpsAgendaPanel } from './followups/followups-agenda-panel'
import type { FollowUpFormData } from './followups/types'

export type { FollowUpFormData } from './followups/types'

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
  const groups = [
    {
      key: 'today' as const,
      title: 'Hoje',
      emptyMessage: 'Nenhum follow-up para hoje.',
      items: todayFollowUps
    },
    {
      key: 'overdue' as const,
      title: 'Atrasados',
      emptyMessage: 'Nenhum follow-up atrasado.',
      items: overdueFollowUps
    },
    {
      key: 'upcoming' as const,
      title: 'Próximos (7 dias)',
      emptyMessage: 'Nenhum follow-up próximo.',
      items: upcomingFollowUps
    }
  ]

  const openCount = todayFollowUps.length + overdueFollowUps.length + upcomingFollowUps.length

  return (
    <section className="followups-page">
      <header className="followups-header">
        <p>Organize os próximos contatos do time e marque conclusões em um clique.</p>
      </header>

      <section className="followups-summary-grid" aria-label="Resumo de follow-ups">
        <article className="followups-summary-card">
          <small>Abertos</small>
          <strong>{openCount}</strong>
        </article>
        <article className="followups-summary-card">
          <small>Hoje</small>
          <strong>{todayFollowUps.length}</strong>
        </article>
        <article className="followups-summary-card">
          <small>Atrasados</small>
          <strong>{overdueFollowUps.length}</strong>
        </article>
        <article className="followups-summary-card">
          <small>Próximos</small>
          <strong>{upcomingFollowUps.length}</strong>
        </article>
      </section>

      <section className="followups-layout-grid">
        <CreateFollowUpPanel
          formData={formData}
          leads={leads}
          isCreatingFollowUp={isCreatingFollowUp}
          createFollowUpErrorMessage={createFollowUpErrorMessage}
          onCreateFollowUp={onCreateFollowUp}
          onFollowUpFieldChange={onFollowUpFieldChange}
        />

        <FollowUpsAgendaPanel
          groups={groups}
          isLoadingFollowUps={isLoadingFollowUps}
          followUpErrorMessage={followUpErrorMessage}
          isMarkingDoneId={isMarkingDoneId}
          onMarkFollowUpAsDone={onMarkFollowUpAsDone}
          onRefreshAgenda={onRefreshAgenda}
          formatDateTime={formatDateTime}
        />
      </section>
    </section>
  )
}
