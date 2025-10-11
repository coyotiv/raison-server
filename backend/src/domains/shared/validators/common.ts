import { Types } from 'mongoose'
import { z } from 'zod'

export const objectIdSchema = z
  .string()
  .trim()
  .refine((value: string) => Types.ObjectId.isValid(value), {
    message: 'Invalid ObjectId',
  })

export const promptContentSchema = z.object({
  systemPrompt: z.string().trim().min(1, 'systemPrompt is required'),
  version: z.string().trim().min(1).optional(),
})

export type ObjectIdInput = z.infer<typeof objectIdSchema>
export type PromptContentInput = z.infer<typeof promptContentSchema>
