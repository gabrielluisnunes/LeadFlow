import { prisma } from '../../lib/prisma.js'
import { ActivityType } from '@prisma/client'
import { ActivitiesService } from '../activities/activities.service.js'

interface CreateFollowUpInput {
  workspaceId: string
  leadId: string
  scheduledAt: Date
}

export class FollowUpsService {

  private activities = new ActivitiesService()

  async create(data: CreateFollowUpInput) {
    const followUp = await prisma.followUp.create({
      data: {
        workspaceId: data.workspaceId,
        leadId: data.leadId,
        scheduledAt: data.scheduledAt
      }
    })

    await this.activities.create({
      workspaceId: data.workspaceId,
      type: ActivityType.FOLLOWUP_CREATED,
      leadId: data.leadId,
      followUpId: followUp.id,
      payload: {
        scheduledAt: followUp.scheduledAt
      }
    })

    return followUp
  }

  async listToday(workspaceId: string) {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const followUps = await prisma.followUp.findMany({
      where: {
        workspaceId,
        doneAt: null,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      },
      include: {
        lead: true
      }
    })

    return followUps
  }

  async listByLead(params: { workspaceId: string; leadId: string }) {
    const followUps = await prisma.followUp.findMany({
      where: {
        workspaceId: params.workspaceId,
        leadId: params.leadId
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    return followUps
  }

  async markAsDone(params: { workspaceId: string; followUpId: string }) {

    const followUp = await prisma.followUp.findFirst({
      where: {
        id: params.followUpId,
        workspaceId: params.workspaceId
      }
    })

    if (!followUp) {
      throw new Error('Follow-up não encontrado')
    }

    const updated = await prisma.followUp.update({
      where: {
        id: followUp.id
      },
      data: {
        doneAt: new Date()
      }
    })

    await this.activities.create({
      workspaceId: params.workspaceId,
      type: ActivityType.FOLLOWUP_DONE,
      leadId: updated.leadId,
      followUpId: updated.id
    })

    return updated
  }

  async listOverdue(workspaceId: string) {
    const now = new Date()

    const followUps = await prisma.followUp.findMany({
      where: {
        workspaceId,
        doneAt: null,
        scheduledAt: {
          lt: now
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      },
      include: {
        lead: true
      }
    })

    return followUps
  }

  async listUpcoming(workspaceId: string) {
    const now = new Date()

    const limitDate = new Date()
    limitDate.setDate(limitDate.getDate() + 7)

    const followUps = await prisma.followUp.findMany({
      where: {
        workspaceId,
        doneAt: null,
        scheduledAt: {
          gt: now,
          lte: limitDate
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      },
      include: {
        lead: true
      }
    })

    return followUps
  }
}
