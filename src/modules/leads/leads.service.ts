import { prisma } from '../../lib/prisma.js'
import { LeadStatus, ActivityType } from '@prisma/client'
import { ActivitiesService } from '../activities/activities.service.js'
import { NotFoundError } from '../../errors/app-error.js'

interface CreateLeadInput {
  workspaceId: string
  name: string
  phone: string
  email?: string
  source?: string
}

interface UpdateLeadInput {
  workspaceId: string
  leadId: string
  name: string
  phone: string
  email?: string
  source?: string
}

interface CreateLeadNoteInput {
  workspaceId: string
  leadId: string
  authorId: string
  content: string
  createdAt?: Date
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
      type: ActivityType.LEAD_CREATED,
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

  async getById(workspaceId: string, leadId: string) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        workspaceId
      },
      include: {
        notes: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorId: true
          }
        }
      }
    })

    if (!lead) {
      throw new NotFoundError('Lead não encontrado')
    }

    return lead
  }

  async update(data: UpdateLeadInput) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: data.leadId,
        workspaceId: data.workspaceId
      }
    })

    if (!lead) {
      throw new NotFoundError('Lead não encontrado')
    }

    const updated = await prisma.lead.update({
      where: {
        id: lead.id
      },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source
      }
    })

    return updated
  }

  async addNote(data: CreateLeadNoteInput) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: data.leadId,
        workspaceId: data.workspaceId
      }
    })

    if (!lead) {
      throw new NotFoundError('Lead não encontrado')
    }

    const note = await prisma.leadNote.create({
      data: {
        workspaceId: data.workspaceId,
        leadId: data.leadId,
        authorId: data.authorId,
        content: data.content,
        createdAt: data.createdAt
      }
    })

    return note
  }

  async updateStatus(params: {
    workspaceId: string
    leadId: string
    status: LeadStatus
  }) {

    const lead = await prisma.lead.findFirst({
      where: {
        id: params.leadId,
        workspaceId: params.workspaceId
      }
    })

    if (!lead) {
      throw new NotFoundError('Lead não encontrado')
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
      type: ActivityType.LEAD_STATUS_UPDATED,
      leadId: updated.id,
      payload: {
        from: oldStatus,
        to: params.status
      }
    })

    return updated
  }
}
