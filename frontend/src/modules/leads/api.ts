import { request } from '../../lib/http'

export type LeadStatus = 'NEW' | 'CONTACTED' | 'WON' | 'LOST'

export interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  source: string | null
  status: LeadStatus
  createdAt: string
}

export function listLeads() {
  return request<Lead[]>('/leads')
}
