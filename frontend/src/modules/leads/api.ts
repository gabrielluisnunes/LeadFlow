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

export interface CreateLeadInput {
  name: string
  phone: string
  email?: string
  source?: string
}

export function listLeads() {
  return request<Lead[]>('/leads')
}

export function createLead(input: CreateLeadInput) {
  return request<Lead>('/leads', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}
