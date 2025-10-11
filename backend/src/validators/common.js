const { z } = require('zod')
const mongoose = require('mongoose')

const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid ObjectId',
  })

const promptContentSchema = z.object({
  systemPrompt: z.string().trim().min(1, 'systemPrompt is required'),
  version: z.string().trim().min(1).optional(),
})

module.exports = {
  objectIdSchema,
  promptContentSchema,
}
