 import { FastifyInstance } from 'fastify'
import { MetricsService } from './metrics.service.js'

export async function metricsRoutes(app: FastifyInstance) {

  const metricsService = new MetricsService()

  app.addHook('preHandler', app.authenticate)

  app.get('/leads-overview', async (request) => {
    const workspaceId = request.user.workspaceId

    const data = await metricsService.getLeadsOverview(workspaceId)

    return {
      data
    }
  })
}
