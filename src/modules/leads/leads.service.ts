import { prisma } from '../../lib/prisma.js'
import { LeadStatus } from '@prisma/client'
import { ActivitiesService } from '../activities/activities.service.js'

interface CreateLeadInput {
  workspaceId: string
  name: string
  phone: string
  email?: string
  source?: string
}

export class LeadsService {

  private activities = new ActivitiesService()

  async create(data: CreateLeadInput) {
    const lead = await prisma.lead.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source,
        status: LeadStatus.NEW
      }
    })

    await this.activities.create({
      workspaceId: data.workspaceId,
      type: 'LEAD_CREATED',
      leadId: lead.id,
      payload: {
        name: lead.name
      }
    })

    return lead
  }

  async listByWorkspaceId(workspaceId: string) {
    const leads = await prisma.lead.findMany({
      where: {
        workspaceId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return leads
  }

  async updateStatus(params: {
    workspaceId: string
    leadId: string
    status: 'NEW' | 'CONTACTED' | 'WON' | 'LOST'
  }) {

    const lead = await prisma.lead.findFirst({
      where: {
        id: params.leadId,
        workspaceId: params.workspaceId
      }
    })

    if (!lead) {
      throw new Error('Lead não encontrado')
    }

    const oldStatus = lead.status

    const updated = await prisma.lead.update({
      where: {
        id: lead.id
      },
      data: {
        status: params.status
      }
    })

    await this.activities.create({
      workspaceId: params.workspaceId,
      type: 'LEAD_STATUS_UPDATED',
      leadId: updated.id,
      payload: {
        from: oldStatus,
        to: params.status
      }
    })

    return updated
  }
}
