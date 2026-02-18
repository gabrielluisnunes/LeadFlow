import { FastifyInstance } from 'fastify'
import { ActivitiesService } from './activities.service.js'

export async function activitiesRoutes(app: FastifyInstance) {

  const activitiesService = new ActivitiesService()

  app.addHook('preHandler', app.authenticate)

  app.get('/', async (request) => {
    const workspaceId = request.user.workspaceId

    const activities = await activitiesService.listByWorkspace(workspaceId)

    return {
      data: activities
    }
  })
}
