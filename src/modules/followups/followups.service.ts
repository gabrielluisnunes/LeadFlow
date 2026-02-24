import { prisma } from '../../lib/prisma.js'
import { ActivityType, FollowUpPriority, FollowUpStatus, LeadStatus } from '@prisma/client'
import { ActivitiesService } from '../activities/activities.service.js'
import { NotFoundError } from '../../errors/app-error.js'

interface CreateFollowUpInput {
  workspaceId: string
  leadId: string
  scheduledAt: Date
  title: string
  priority: FollowUpPriority
  notes?: string
}

export class FollowUpsService {

  private activities = new ActivitiesService()

  async create(data: CreateFollowUpInput) {
    return prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findFirst({
        where: {
          id: data.leadId,
          workspaceId: data.workspaceId
        }
      })

      if (!lead) {
        throw new NotFoundError('Lead não encontrado')
      }

      const followUp = await tx.followUp.create({
        data: {
          workspaceId: data.workspaceId,
          leadId: data.leadId,
          scheduledAt: data.scheduledAt,
          title: data.title.trim(),
          priority: data.priority,
          notes: data.notes?.trim() || null,
          status: FollowUpStatus.PENDING
        }
      })

      const updatedLead = await tx.lead.update({
        where: {
          id: data.leadId
        },
        data: {
          status: LeadStatus.CONTACTED
        }
      })

      if (lead.status !== updatedLead.status) {
        await this.activities.create(
          {
            workspaceId: data.workspaceId,
            type: ActivityType.LEAD_STATUS_UPDATED,
            leadId: updatedLead.id,
            payload: {
              from: lead.status,
              to: updatedLead.status
            }
          },
          tx
        )
      }

      await this.activities.create(
        {
          workspaceId: data.workspaceId,
          type: ActivityType.FOLLOWUP_CREATED,
          leadId: data.leadId,
          followUpId: followUp.id,
          payload: {
            scheduledAt: followUp.scheduledAt,
            title: followUp.title,
            priority: followUp.priority
          }
        },
        tx
      )

      return followUp
    })
  }

  async listToday(workspaceId: string) {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const followUps = await prisma.followUp.findMany({
      where: {
        workspaceId,
        status: FollowUpStatus.PENDING,
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

  async markAsDone(params: { workspaceId: string; followUpId: string; outcome?: string }) {
    return prisma.$transaction(async (tx) => {
      const followUp = await tx.followUp.findFirst({
        where: {
          id: params.followUpId,
          workspaceId: params.workspaceId
        }
      })

      if (!followUp) {
        throw new NotFoundError('Follow-up não encontrado')
      }

      const updated = await tx.followUp.update({
        where: {
          id: followUp.id
        },
        data: {
          doneAt: new Date(),
          status: FollowUpStatus.DONE,
          outcome: params.outcome?.trim() || null,
          canceledAt: null
        }
      })

      await this.activities.create(
        {
          workspaceId: params.workspaceId,
          type: ActivityType.FOLLOWUP_DONE,
          leadId: updated.leadId,
          followUpId: updated.id,
          payload: {
            outcome: updated.outcome
          }
        },
        tx
      )

      const lead = await tx.lead.findFirst({
        where: {
          id: updated.leadId,
          workspaceId: params.workspaceId
        }
      })

      if (lead && lead.status !== LeadStatus.WON) {
        await tx.lead.update({
          where: {
            id: lead.id
          },
          data: {
            status: LeadStatus.WON
          }
        })

        await this.activities.create(
          {
            workspaceId: params.workspaceId,
            type: ActivityType.LEAD_STATUS_UPDATED,
            leadId: lead.id,
            payload: {
              from: lead.status,
              to: LeadStatus.WON
            }
          },
          tx
        )
      }

      return updated
    })
  }

  async listOverdue(workspaceId: string) {
    const now = new Date()

    const followUps = await prisma.followUp.findMany({
      where: {
        workspaceId,
        status: FollowUpStatus.PENDING,
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
        status: FollowUpStatus.PENDING,
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

  async cancel(params: { workspaceId: string; followUpId: string; reason?: string }) {
    return prisma.$transaction(async (tx) => {
      const followUp = await tx.followUp.findFirst({
        where: {
          id: params.followUpId,
          workspaceId: params.workspaceId
        }
      })

      if (!followUp) {
        throw new NotFoundError('Follow-up não encontrado')
      }

      const updated = await tx.followUp.update({
        where: {
          id: followUp.id
        },
        data: {
          status: FollowUpStatus.CANCELED,
          canceledAt: new Date(),
          doneAt: null,
          outcome: params.reason?.trim() || 'Perdido'
        }
      })

      await this.activities.create(
        {
          workspaceId: params.workspaceId,
          type: ActivityType.FOLLOWUP_CANCELED,
          leadId: updated.leadId,
          followUpId: updated.id,
          payload: {
            reason: updated.outcome
          }
        },
        tx
      )

      const lead = await tx.lead.findFirst({
        where: {
          id: updated.leadId,
          workspaceId: params.workspaceId
        }
      })

      if (lead && lead.status !== LeadStatus.LOST) {
        await tx.lead.update({
          where: {
            id: lead.id
          },
          data: {
            status: LeadStatus.LOST
          }
        })

        await this.activities.create(
          {
            workspaceId: params.workspaceId,
            type: ActivityType.LEAD_STATUS_UPDATED,
            leadId: lead.id,
            payload: {
              from: lead.status,
              to: LeadStatus.LOST
            }
          },
          tx
        )
      }

      return updated
    })
  }

  async reschedule(params: { workspaceId: string; followUpId: string; scheduledAt: Date; notes?: string }) {
    return prisma.$transaction(async (tx) => {
      const followUp = await tx.followUp.findFirst({
        where: {
          id: params.followUpId,
          workspaceId: params.workspaceId
        }
      })

      if (!followUp) {
        throw new NotFoundError('Follow-up não encontrado')
      }

      const updated = await tx.followUp.update({
        where: {
          id: followUp.id
        },
        data: {
          scheduledAt: params.scheduledAt,
          notes: params.notes?.trim() || followUp.notes,
          status: FollowUpStatus.PENDING,
          doneAt: null,
          canceledAt: null,
          outcome: null
        }
      })

      await this.activities.create(
        {
          workspaceId: params.workspaceId,
          type: ActivityType.FOLLOWUP_UPDATED,
          leadId: updated.leadId,
          followUpId: updated.id,
          payload: {
            scheduledAt: updated.scheduledAt,
            notes: updated.notes
          }
        },
        tx
      )

      return updated
    })
  }
}
