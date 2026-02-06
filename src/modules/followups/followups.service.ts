import { prisma } from '../../lib/prisma.js'

interface CreateFollowUpInput {
  workspaceId: string
  leadId: string
  scheduledAt: Date
}

export class FollowUpsService {

  async create(data: CreateFollowUpInput) {
    const followUp = await prisma.followUp.create({
      data: {
        workspaceId: data.workspaceId,
        leadId: data.leadId,
        scheduledAt: data.scheduledAt
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
    const followUp = await prisma.followUp.update({
      where: {
        id: params.followUpId
      },
      data: {
        doneAt: new Date()
      }
    })

    return followUp
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
