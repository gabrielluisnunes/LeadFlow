import { FastifyInstance } from 'fastify'
import { FollowUpsService } from './followups.service.js'
import { createFollowupSchema} from './followups.schemas.js'

export async function followUpsRoutes(app: FastifyInstance) {
  const followUpsService = new FollowUpsService()

  app.addHook('preHandler', app.authenticate)

  app.post('/', async (request, reply) => {
    const body = createFollowupSchema.parse(request.body)

    const workspaceId = request.user.workspaceId

    const followUp = await followUpsService.create({
      workspaceId,
      leadId: body.leadId,
      scheduledAt: new Date(body.scheduledAt)
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
    const workspaceId = request.user.workspaceId

    const followUp = await followUpsService.markAsDone({
      workspaceId,
      followUpId
    })

    return {
      data: followUp
    }
  })
}
