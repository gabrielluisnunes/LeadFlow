import { request } from '../../lib/http'

interface FollowUpLead {
  id: string
  name: string
}

export type FollowUpPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type FollowUpStatus = 'PENDING' | 'DONE' | 'CANCELED'

export interface FollowUp {
  id: string
  workspaceId: string
  leadId: string
  title: string
  priority: FollowUpPriority
  status: FollowUpStatus
  notes: string | null
  outcome: string | null
  scheduledAt: string
  doneAt: string | null
  canceledAt: string | null
  createdAt: string
}

export interface FollowUpWithLead extends FollowUp {
  lead: FollowUpLead
}

interface CreateFollowUpInput {
  leadId: string
  scheduledAt: string
  title: string
  priority: FollowUpPriority
  notes?: string
}

interface ConcludeFollowUpInput {
  outcome?: string
}

interface CancelFollowUpInput {
  reason?: string
}

interface RescheduleFollowUpInput {
  scheduledAt: string
  notes?: string
}

export function createFollowUp(input: CreateFollowUpInput) {
  return request<FollowUp>('/followups', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

export function listAllFollowUps() {
  return request<FollowUpWithLead[]>('/followups')
}

export function listTodayFollowUps() {
  return request<FollowUpWithLead[]>('/followups/today')
}

export function listOverdueFollowUps() {
  return request<FollowUpWithLead[]>('/followups/overdue')
}

export function listUpcomingFollowUps() {
  return request<FollowUpWithLead[]>('/followups/upcoming')
}

export function markFollowUpAsDone(followUpId: string) {
  return request<FollowUp>(`/followups/${followUpId}/done`, {
    method: 'PATCH'
  })
}

export function concludeFollowUp(followUpId: string, input: ConcludeFollowUpInput = {}) {
  return request<FollowUp>(`/followups/${followUpId}/done`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  })
}

export function cancelFollowUp(followUpId: string, input: CancelFollowUpInput = {}) {
  return request<FollowUp>(`/followups/${followUpId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  })
}

export function rescheduleFollowUp(followUpId: string, input: RescheduleFollowUpInput) {
  return request<FollowUp>(`/followups/${followUpId}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  })
}
