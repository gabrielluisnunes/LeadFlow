import { request } from '../../lib/http'

interface FollowUpLead {
  id: string
  name: string
}

export interface FollowUp {
  id: string
  workspaceId: string
  leadId: string
  scheduledAt: string
  doneAt: string | null
  createdAt: string
}

export interface FollowUpWithLead extends FollowUp {
  lead: FollowUpLead
}

interface CreateFollowUpInput {
  leadId: string
  scheduledAt: string
}

export function createFollowUp(input: CreateFollowUpInput) {
  return request<FollowUp>('/followups', {
    method: 'POST',
    body: JSON.stringify(input)
  })
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
