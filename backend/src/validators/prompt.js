const { z } = require('zod')
const mongoose = require('mongoose')

const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid ObjectId',
  })

const promptListQuerySchema = z.object({
  agentId: objectIdSchema.optional(),
})

const promptCreateSchema = z.object({
  agentId: objectIdSchema,
  systemPrompt: z.string().trim().min(1, 'systemPrompt is required'),
  version: z.string().trim().min(1).optional(),
})

const promptUpdateSchema = z
  .object({
    systemPrompt: z.string().trim().min(1, 'systemPrompt is required').optional(),
    version: z.string().trim().min(1).optional(),
  })
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
