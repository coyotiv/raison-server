import { z } from 'zod'
import { objectIdSchema, tagItemSchema } from '@/domains/shared/validators'
import { DEFAULT_PROMPT_TAG, normalizeTags } from '@/lib/tags'

export const promptListQuerySchema = z.object({
  agentId: objectIdSchema.optional(),
})

export const promptCreateSchema = z.object({
  agentId: objectIdSchema,
  systemPrompt: z.string().trim().min(1, 'systemPrompt is required'),
  tags: z
    .array(tagItemSchema)
    .nonempty('At least one tag is required')
    .default([DEFAULT_PROMPT_TAG])
    .transform((tags) => normalizeTags(tags)),
})

export const promptUpdateSchema = z
  .object({
    systemPrompt: z.string().trim().min(1, 'systemPrompt is required').optional(),
    tags: z
      .array(tagItemSchema)
      .optional()
      .transform((tags) => (tags === undefined ? undefined : normalizeTags(tags))),
  })
  .refine((data) => data.systemPrompt !== undefined || data.tags !== undefined, {
    message: 'At least one field must be provided',
  })

export const promptIdParamSchema = z.object({
  id: objectIdSchema,
})

export type PromptListQuery = z.infer<typeof promptListQuerySchema>
export type PromptCreateInput = z.infer<typeof promptCreateSchema>
export type PromptUpdateInput = z.infer<typeof promptUpdateSchema>
export type PromptIdParams = z.infer<typeof promptIdParamSchema>
