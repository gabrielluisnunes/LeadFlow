import {z} from 'zod'

export const createLeadSchema = z.object({
    name: z.string().min(3),
    phone: z.string().min(10).max(11),
    email: z.string().email().optional(),
    source: z.string().optional(),
})

export const updateLeadSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10).max(11),
  email: z.string().email().optional(),
  source: z.string().optional()
})

export const createLeadNoteSchema = z.object({
  content: z.string().min(1),
  createdAt: z.string().datetime().optional()
})

export const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'WON', 'LOST'])
})
