import { Types } from 'mongoose'
import { z } from 'zod'
import { DEFAULT_PROMPT_TAG, normalizeTags } from '@/lib/tags'

export const objectIdSchema = z.any().refine((value: string) => Types.ObjectId.isValid(value), {
  message: 'Invalid ObjectId',
})
export const dateSchema = z.any()

export const errorSchema = z.object({
  message: z.string().trim().min(1, 'Message is required'),
})

export const tagItemSchema = z.string().trim().min(1, 'tags must be non-empty strings')

export const promptContentSchema = z.object({
  systemPrompt: z.string().trim().min(1, 'systemPrompt is required'),
  tags: z
    .array(tagItemSchema)
    .nonempty('At least one tag is required')
    .default([DEFAULT_PROMPT_TAG])
    .transform((tags) => normalizeTags(tags)),
})

export type ObjectIdInput = z.infer<typeof objectIdSchema>
export type PromptContentInput = z.infer<typeof promptContentSchema>
