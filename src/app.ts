import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { authRoutes } from './modules/auth/auth.routes.js'
import { leadsRoutes } from './modules/leads/leads.routes.js'
import authPlugin from './plugins/auth.js'

export const app = Fastify({
  logger: true
})

await app.register(cors, {
  origin: true
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
