import { request } from '../../lib/http'

export type ActivityType =
  | 'LEAD_CREATED'
  | 'LEAD_STATUS_UPDATED'
  | 'FOLLOWUP_CREATED'
  | 'FOLLOWUP_DONE'

export interface Activity {
  id: string
  workspaceId: string
  type: ActivityType
  leadId: string | null
  followUpId: string | null
  payload: unknown
  createdAt: string
}

export function listActivities() {
  return request<Activity[]>('/activities')
}
