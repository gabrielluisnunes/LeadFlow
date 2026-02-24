import {z } from 'zod'

const followUpPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])

export const createFollowupSchema = z.object({
    leadId: z.string(),
    scheduledAt: z.string().datetime(),
    title: z.string().min(2).max(120),
    priority: followUpPrioritySchema.default('MEDIUM'),
    notes: z.string().max(1000).optional(),
})

export const concludeFollowupSchema = z.object({
    outcome: z.string().max(1000).optional()
})

export const cancelFollowupSchema = z.object({
    reason: z.string().max(1000).optional()
})

export const rescheduleFollowupSchema = z.object({
    scheduledAt: z.string().datetime(),
    notes: z.string().max(1000).optional()
})