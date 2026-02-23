import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

import { authRoutes } from './modules/auth/auth.routes.js'
import { leadsRoutes } from './modules/leads/leads.routes.js'
import authPlugin from './plugins/auth.js'
import { followUpsRoutes } from './modules/followups/followups.routes.js'
import { metricsRoutes } from './modules/metrics/metrics.routes.js'
import { activitiesRoutes } from './modules/activities/activities.routes.js'
import { AppError } from './errors/app-error.js'


export const app = Fastify({
  logger: true
})

await app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-secret'
})

await app.register(authPlugin)

await app.register(authRoutes, {
  prefix: '/auth'
})

await app.register(leadsRoutes, {
  prefix: '/leads'
})

await app.register(followUpsRoutes, {
  prefix: '/followups'
})

await app.register(metricsRoutes, {
  prefix: '/metrics'
})

await app.register(activitiesRoutes, {
  prefix: '/activities'
})

app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: error.issues
      }
    })
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return reply.status(409).send({
      error: {
        code: 'CONFLICT',
        message: 'Registro já existe'
      }
    })
  }

  request.log.error(error)

  return reply.status(500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno no servidor'
    }
  })
})
