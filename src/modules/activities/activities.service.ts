import { prisma } from '../../lib/prisma.js'
import { ActivityType } from '@prisma/client'

interface CreateActivityInput {
  workspaceId: string
  type: ActivityType
  leadId?: string
  followUpId?: string
  payload?: unknown
}

export class ActivitiesService {

  async create(data: CreateActivityInput) {
    return prisma.activity.create({
      data: {
        workspaceId: data.workspaceId,
        type: data.type,
        leadId: data.leadId,
        followUpId: data.followUpId,
        payload: data.payload
      }
    })
  }

  async listByWorkspace(workspaceId: string) {
    return prisma.activity.findMany({
      where: {
        workspaceId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}
