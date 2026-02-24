import type { FollowUpWithLead } from '../../../../modules/followups/api'

export interface FollowUpFormData {
  leadId: string
  scheduledAt: string
}

export interface FollowUpGroup {
  key: 'today' | 'overdue' | 'upcoming'
  title: string
  emptyMessage: string
  items: FollowUpWithLead[]
}
