import { prisma } from '../../lib/prisma.js'
import { ActivityType, Prisma, PrismaClient } from '@prisma/client'

interface CreateActivityInput {
  workspaceId: string
  type: ActivityType
  leadId?: string
  followUpId?: string
  payload?: unknown
}

type DbClient = PrismaClient | Prisma.TransactionClient

export class ActivitiesService {

  async create(data: CreateActivityInput, db: DbClient = prisma) {
    return db.activity.create({
      data: {
        workspaceId: data.workspaceId,
        type: data.type,
        leadId: data.leadId,
        followUpId: data.followUpId,
        payload: data.payload as any
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
