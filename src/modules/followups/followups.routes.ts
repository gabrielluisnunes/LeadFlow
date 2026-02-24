import { FastifyInstance } from 'fastify'
import { FollowUpsService } from './followups.service.js'
import {
  cancelFollowupSchema,
  concludeFollowupSchema,
  createFollowupSchema,
  rescheduleFollowupSchema
} from './followups.schemas.js'

export async function followUpsRoutes(app: FastifyInstance) {
  const followUpsService = new FollowUpsService()

  app.addHook('preHandler', app.authenticate)

  app.post('/', async (request, reply) => {
    const body = createFollowupSchema.parse(request.body)

    const workspaceId = request.user.workspaceId

    const followUp = await followUpsService.create({
      workspaceId,
      leadId: body.leadId,
      scheduledAt: new Date(body.scheduledAt),
      title: body.title,
      priority: body.priority,
      notes: body.notes
    })

    return reply.code(201).send({
      data: followUp
    })
  })

  app.get('/lead/:leadId', async (request) => {
    const { leadId } = request.params as { leadId: string }
    const workspaceId = request.user.workspaceId

    const followUps = await followUpsService.listByLead({
      workspaceId,
      leadId
    })

    return {
      data: followUps
    }
  })

    app.get('/today', async (request) => {
    const workspaceId = request.user.workspaceId

    const followUps = await followUpsService.listToday(workspaceId)

    return {
      data: followUps
    }
  })

    app.get('/overdue', async (request) => {
    const workspaceId = request.user.workspaceId

    const followUps = await followUpsService.listOverdue(workspaceId)

    return {
      data: followUps
    }
  })

    app.get('/upcoming', async (request) => {
    const workspaceId = request.user.workspaceId

    const followUps = await followUpsService.listUpcoming(workspaceId)

    return {
      data: followUps
    }
  })

  app.patch('/:followUpId/done', async (request) => {
    const { followUpId } = request.params as { followUpId: string }
    const body = concludeFollowupSchema.parse(request.body ?? {})
    const workspaceId = request.user.workspaceId

    const followUp = await followUpsService.markAsDone({
      workspaceId,
      followUpId,
      outcome: body.outcome
    })

    return {
      data: followUp
    }
  })

  app.patch('/:followUpId/cancel', async (request) => {
    const { followUpId } = request.params as { followUpId: string }
    const body = cancelFollowupSchema.parse(request.body ?? {})
    const workspaceId = request.user.workspaceId

    const followUp = await followUpsService.cancel({
      workspaceId,
      followUpId,
      reason: body.reason
    })

    return {
      data: followUp
    }
  })

  app.patch('/:followUpId/reschedule', async (request) => {
    const { followUpId } = request.params as { followUpId: string }
    const body = rescheduleFollowupSchema.parse(request.body)
    const workspaceId = request.user.workspaceId

    const followUp = await followUpsService.reschedule({
      workspaceId,
      followUpId,
      scheduledAt: new Date(body.scheduledAt),
      notes: body.notes
    })

    return {
      data: followUp
    }
  })
}
