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

export interface LeadNote {
  id: string
  content: string
  authorId: string
  createdAt: string
}

export interface LeadDetails extends Lead {
  notes: LeadNote[]
}

export interface CreateLeadInput {
  name: string
  phone: string
  email?: string
  source?: string
}

export interface UpdateLeadInput {
  name: string
  phone: string
  email?: string
  source?: string
}

export interface CreateLeadNoteInput {
  content: string
  createdAt?: string
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

export function getLeadDetails(leadId: string) {
  return request<LeadDetails>(`/leads/${leadId}`)
}

export function updateLead(leadId: string, input: UpdateLeadInput) {
  return request<Lead>(`/leads/${leadId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  })
}

export function addLeadNote(leadId: string, input: CreateLeadNoteInput) {
  return request<LeadNote>(`/leads/${leadId}/notes`, {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

export function updateLeadStatus(leadId: string, status: LeadStatus) {
  return request<Lead>(`/leads/${leadId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}
