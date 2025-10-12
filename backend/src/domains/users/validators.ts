import { z } from 'zod'
import { dateSchema, errorSchema, objectIdSchema } from '@/domains/shared/validators/common'

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, 'User name is required'),
})

export const userUpdateSchema = userCreateSchema.partial().refine(value => Object.keys(value).length > 0, {
  message: 'At least one field is required to update a user',
})

export const userIdParamSchema = z.object({
  id: objectIdSchema,
})

const userSchema = z.object({
  _id: objectIdSchema,
  name: z.string().trim().min(1, 'User name is required'),
  createdAt: dateSchema,
  updatedAt: dateSchema,
})

export const listUsersRequest = {
  useResponse: {
    200: z.array(userSchema),
    400: errorSchema,
    500: errorSchema,
  },
}

export const getUserRequest = {
  params: userIdParamSchema,
  useResponse: {
    200: userSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export const createUserRequest = {
  body: userCreateSchema,
  useResponse: {
    201: userSchema,
    400: errorSchema,
    500: errorSchema,
  },
}

export const updateUserRequest = {
  params: userIdParamSchema,
  body: userUpdateSchema,
  useResponse: {
    200: userSchema,
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export const deleteUserRequest = {
  params: userIdParamSchema,
  useResponse: {
    204: z.null(),
    400: errorSchema,
    404: errorSchema,
    500: errorSchema,
  },
}

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type UserIdParams = z.infer<typeof userIdParamSchema>
