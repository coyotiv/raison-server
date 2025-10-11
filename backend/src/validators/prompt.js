const { z } = require('zod')
const { objectIdSchema, promptContentSchema } = require('./common')

const promptListQuerySchema = z.object({
  agentId: objectIdSchema.optional(),
})

const promptCreateSchema = z.object({
  agentId: objectIdSchema,
  ...promptContentSchema.shape,
})

const promptUpdateSchema = z
  .object(promptContentSchema.partial().shape)
  .refine((data) => data.systemPrompt !== undefined || data.version !== undefined, {
    message: 'At least one field must be provided',
  })

const promptIdParamSchema = z.object({
  id: objectIdSchema,
})

module.exports = {
  objectIdSchema,
  promptListQuerySchema,
  promptCreateSchema,
  promptUpdateSchema,
  promptIdParamSchema,
}
