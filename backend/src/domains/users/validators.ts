import { z } from 'zod'
import { objectIdSchema } from '@/domains/shared/validators/index.js'

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, 'User name is required'),
})

export const userUpdateSchema = userCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required to update a user',
})

export const userIdParamSchema = z.object({
  id: objectIdSchema,
})

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type UserIdParams = z.infer<typeof userIdParamSchema>
