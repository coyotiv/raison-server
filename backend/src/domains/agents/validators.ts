import { z } from 'zod'
import { dateSchema, objectIdSchema, promptContentSchema } from '@/domains/shared/validators/common'

const errorSchema = z.object({
  message: z.string().trim().min(1, 'Message is required'),
})

const agentBaseSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required'),
})

const agentPromptArraySchema = z.array(promptContentSchema).min(1, 'At least one prompt is required')

export const agentCreateSchema = agentBaseSchema.extend({
  prompts: agentPromptArraySchema,
})

export const agentIdParamSchema = z.object({
  id: objectIdSchema,
})

export const agentNameParamSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required'),
})

export const agentTagsQuerySchema = z.object({
  tag: z.string().trim().optional(),
})

export const agentSchema = agentBaseSchema.extend({
  _id: objectIdSchema,
  prompts: agentPromptArraySchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
  systemPrompt: z.string().trim().nullable(),
})

export const agentUpdateSchema = agentBaseSchema.extend({
  prompts: agentPromptArraySchema.optional(),
})

export const agentPromptCreateSchema = promptContentSchema

export const listAgentsRequest = {
  query: agentTagsQuerySchema,
  useResponse: {
    200: z.array(agentSchema),
    400: errorSchema,
    500: errorSchema,
  },
}

export const getAgentRequest = {
  params: agentIdParamSchema,
  query: agentTagsQuerySchema,
  useResponse: {
    200: agentSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export const createAgentRequest = {
  body: agentCreateSchema,
  useResponse: {
    201: agentSchema,
    400: errorSchema,
    500: errorSchema,
  },
}

export const updateAgentRequest = {
  params: agentIdParamSchema,
  body: agentUpdateSchema,
  useResponse: {
    200: agentSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export const addPromptToAgentRequest = {
  params: agentIdParamSchema,
  body: agentPromptCreateSchema,
  useResponse: {
    200: agentSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export const deleteAgentRequest = {
  params: agentIdParamSchema,
  useResponse: {
    204: z.null(),
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export type AgentCreateInput = z.infer<typeof agentCreateSchema>
export type AgentUpdateInput = z.infer<typeof agentUpdateSchema>
export type AgentPromptCreateInput = z.infer<typeof agentPromptCreateSchema>
