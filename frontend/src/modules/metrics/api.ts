import { request } from '../../lib/http'

export interface LeadsOverviewMetrics {
  totalLeads: number
  byStatus: {
    NEW: number
    CONTACTED: number
    WON: number
    LOST: number
  }
  conversaionRate: number
}

export function getLeadsOverviewMetrics() {
  return request<LeadsOverviewMetrics>('/metrics/leads-overview')
}
