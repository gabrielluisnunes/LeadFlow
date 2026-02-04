import { FastifyInstance } from "fastify";
import { AuthService } from "./auth.service.js";
import {registerSchema, loginSchema} from "./auth.schemas.js";

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();

    app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body)

    const result = await authService.register(body)

    const token = app.jwt.sign({
      userId: result.user.id,
      workspaceId: result.workspace.id
    })

    return reply.code(201).send({
      token
    })
  })

} 