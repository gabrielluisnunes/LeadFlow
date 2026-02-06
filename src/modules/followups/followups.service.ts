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
}
