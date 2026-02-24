import type { FollowUpPriority, FollowUpWithLead } from '../../../../modules/followups/api'

export interface FollowUpFormData {
  leadId: string
  scheduledAt: string
  title: string
  priority: FollowUpPriority
  notes: string
}

export interface FollowUpGroup {
  key: 'today' | 'overdue' | 'upcoming'
  title: string
  emptyMessage: string
  items: FollowUpWithLead[]
}

export type FollowUpAction = 'done' | 'reschedule' | 'cancel'
