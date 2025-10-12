import { z } from 'zod'
import { objectIdSchema, promptContentSchema } from '@/domains/shared/validators'

const agentBaseSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required'),
})

const agentPromptArraySchema = z.array(promptContentSchema).min(1, 'At least one prompt is required')

export const agentCreateSchema = agentBaseSchema.extend({
  prompts: agentPromptArraySchema,
})

export const agentUpdateSchema = agentBaseSchema.extend({
  prompts: agentPromptArraySchema.optional(),
})

export const agentIdParamSchema = z.object({
  id: objectIdSchema,
})

export const agentListQuerySchema = z.object({
  tag: z.string().trim().optional(),
})

export const agentPromptCreateSchema = promptContentSchema

export type AgentCreateInput = z.infer<typeof agentCreateSchema>
export type AgentUpdateInput = z.infer<typeof agentUpdateSchema>
export type AgentIdParams = z.infer<typeof agentIdParamSchema>
export type AgentListQuery = z.infer<typeof agentListQuerySchema>
export type AgentPromptCreateInput = z.infer<typeof agentPromptCreateSchema>
