import { FastifyInstance } from "fastify";
import { AuthService } from "./auth.service.js";
import {registerSchema, loginSchema} from "./auth.schemas.js";

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();
} 