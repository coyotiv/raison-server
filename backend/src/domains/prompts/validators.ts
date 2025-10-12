import { z } from 'zod'
import { DEFAULT_PROMPT_TAG, normalizeTags } from '@/lib/tags'
import { dateSchema, errorSchema, tagItemSchema, objectIdSchema } from '@/domains/shared/validators/common'

export const promptListQuerySchema = z.object({
  agentId: objectIdSchema.optional(),
})

export const promptCreateSchema = z.object({
  agentId: objectIdSchema,
  systemPrompt: z.string().trim().min(1, 'systemPrompt is required'),
  tags: z
    .array(tagItemSchema)
    .default([])
    .transform((tags) => normalizeTags(tags, { allowEmpty: true })),
})

const promptSchema = z.object({
  _id: objectIdSchema,
  agent: objectIdSchema,
  systemPrompt: z.string().trim(),
  tags: z.array(tagItemSchema),
  createdAt: dateSchema,
  updatedAt: dateSchema,
})

export const promptUpdateSchema = z
  .object({
    systemPrompt: z.string().trim().min(1, 'systemPrompt is required').optional(),
    tags: z
      .array(tagItemSchema)
      .optional()
      .transform((tags) => (tags === undefined ? undefined : normalizeTags(tags, { allowEmpty: true }))),
  })
  .refine((data) => data.systemPrompt !== undefined || data.tags !== undefined, {
    message: 'At least one field must be provided',
  })

export const promptIdParamSchema = z.object({
  id: objectIdSchema,
})

export const listPromptsRequest = {
  query: promptListQuerySchema,
  useResponse: {
    200: z.array(promptSchema),
    400: errorSchema,
    500: errorSchema,
  },
}

export const getPromptRequest = {
  params: promptIdParamSchema,
  useResponse: {
    200: promptSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export const createPromptRequest = {
  body: promptCreateSchema,
  useResponse: {
    201: promptSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export const updatePromptRequest = {
  params: promptIdParamSchema,
  body: promptUpdateSchema,
  useResponse: {
    200: promptSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export const deletePromptRequest = {
  params: promptIdParamSchema,
  useResponse: {
    204: z.null(),
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export type PromptListQuery = z.infer<typeof promptListQuerySchema>
export type PromptCreateInput = z.infer<typeof promptCreateSchema>
export type PromptUpdateInput = z.infer<typeof promptUpdateSchema>
export type PromptIdParams = z.infer<typeof promptIdParamSchema>
