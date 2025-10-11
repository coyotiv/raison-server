const { z } = require('zod')
const { objectIdSchema, promptContentSchema } = require('./common')

const agentBaseSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required'),
})

const agentPromptArraySchema = z.array(promptContentSchema).min(1, 'At least one prompt is required')

const agentCreateSchema = agentBaseSchema.extend({
  prompts: agentPromptArraySchema,
})

const agentUpdateSchema = agentBaseSchema.extend({
  prompts: agentPromptArraySchema.optional(),
})

const agentIdParamSchema = z.object({
  id: objectIdSchema,
})

const agentListQuerySchema = z.object({
  version: z.string().trim().optional(),
})

const agentPromptCreateSchema = promptContentSchema

module.exports = {
  objectIdSchema,
  promptContentSchema,
  agentCreateSchema,
  agentUpdateSchema,
  agentIdParamSchema,
  agentListQuerySchema,
  agentPromptCreateSchema,
}
