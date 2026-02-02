import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

export const app = Fastify({
  logger: true
})

await app.register(cors, {
  origin: true
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-secret'
})
