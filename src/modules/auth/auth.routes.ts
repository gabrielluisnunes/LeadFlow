import { FastifyInstance } from "fastify";
import { AuthService } from "./auth.service.js";
import {registerSchema, loginSchema, identifySchema} from "./auth.schemas.js";

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();

  app.post('/identify', async (request, reply) => {
    const body = identifySchema.parse(request.body)

    const result = await authService.identifyByEmail(body.email)

    return reply.send({
      data: result
    })
  })

    app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body)

    const result = await authService.register(body)

    const token = app.jwt.sign({
      userId: result.user.id,
      workspaceId: result.workspace.id
    })

    return reply.code(201).send({
      data: {
        token
      }
    })
  })

    app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)

    const result = await authService.login(
      body.email,
      body.password,
      body.workspaceName,
      body.workspaceMode
    )

    const token = app.jwt.sign({
      userId: result.user.id,
      workspaceId: result.workspace.id
    })

    return reply.send({
      data: {
        token
      }
    })
  })


} 