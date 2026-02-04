import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

export const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch {
        return reply.status(401).send({
          message: 'Não autorizado'
        })
      }
    }
  )
}
