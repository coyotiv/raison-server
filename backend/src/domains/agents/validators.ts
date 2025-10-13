import { z } from 'zod'
import { dateSchema, objectIdSchema, promptContentSchema } from '@/domains/shared/validators/common'

const errorSchema = z.object({
  message: z.string().trim().min(1, 'Message is required'),
})

const agentPromptArraySchema = z.array(promptContentSchema).min(1, 'At least one prompt is required')

export const agentCreateSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required'),
  prompt: promptContentSchema,
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

export const agentSchema = z.object({
  _id: objectIdSchema,
  name: z.string().trim().min(1, 'Agent name is required'),
  systemPrompt: z.string().trim().nullish(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
})

export const agentUpdateSchema = z
  .object({
    name: z.string().optional(),
    prompt: promptContentSchema.optional(),
  })
  .refine(data => data.name !== undefined || data.prompt !== undefined, {
    message: 'At least one field must be provided',
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
