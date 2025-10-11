import { z } from 'zod'

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, 'User name is required'),
})

export const userIdParamSchema = z.object({
  id: z.string().trim().min(1, 'User id is required'),
})

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserIdParams = z.infer<typeof userIdParamSchema>
