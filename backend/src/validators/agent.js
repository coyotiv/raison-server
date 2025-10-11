const { z } = require('zod')
const mongoose = require('mongoose')

const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid ObjectId',
  })

const agentCreateSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required'),
})

const agentUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required'),
})

const agentIdParamSchema = z.object({
  id: objectIdSchema,
})

const agentListQuerySchema = z.object({
  version: z.string().trim().optional(),
})

const agentPromptCreateSchema = z.object({
  systemPrompt: z.string().trim().min(1, 'systemPrompt is required'),
  version: z.string().trim().optional(),
})

module.exports = {
  objectIdSchema,
  agentCreateSchema,
  agentUpdateSchema,
  agentIdParamSchema,
  agentListQuerySchema,
  agentPromptCreateSchema,
}
