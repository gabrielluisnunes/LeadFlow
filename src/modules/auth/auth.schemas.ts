import {z} from 'zod'

const workspaceModeSchema = z.enum(['CREATE', 'JOIN'])

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    workspaceName: z.string().min(2),
    workspaceMode: workspaceModeSchema
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    workspaceName: z.string().min(2),
    workspaceMode: workspaceModeSchema
})

export const identifySchema = z.object({
    email: z.string().email()
})