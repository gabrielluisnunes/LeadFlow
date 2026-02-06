import {z } from 'zod'

export const createFollowupSchema = z.object({
    leadId: z.string(),
    scheduledAt: z.string().datetime(),
})