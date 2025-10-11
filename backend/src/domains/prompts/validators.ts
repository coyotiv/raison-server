import { z } from 'zod'
import { objectIdSchema } from '@/domains/shared/validators/index.js'

export const promptListQuerySchema = z.object({
  agentId: objectIdSchema.optional(),
})

export const promptCreateSchema = z.object({
  agentId: objectIdSchema,
  systemPrompt: z.string().trim().min(1, 'systemPrompt is required'),
  version: z.string().trim().min(1).optional(),
})

export const promptUpdateSchema = z
  .object({
    systemPrompt: z.string().trim().min(1, 'systemPrompt is required').optional(),
    version: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.systemPrompt !== undefined || data.version !== undefined, {
    message: 'At least one field must be provided',
  })

export const promptIdParamSchema = z.object({
  id: objectIdSchema,
})

export type PromptListQuery = z.infer<typeof promptListQuerySchema>
export type PromptCreateInput = z.infer<typeof promptCreateSchema>
export type PromptUpdateInput = z.infer<typeof promptUpdateSchema>
export type PromptIdParams = z.infer<typeof promptIdParamSchema>
