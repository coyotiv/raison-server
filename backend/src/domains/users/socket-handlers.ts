import type { Socket } from 'socket.io'

import { respondWithError, respondWithSuccess, formatUnknownError } from '@/domains/shared/socket'
import { formatZodError } from '@/lib/error-handler'
import type { UsersInitialEvent } from '@/types'

import { listUsers, findUserById, createUser, updateUser, deleteUser } from './service'
import { userCreateSchema, userUpdateSchema, userIdParamSchema } from './validators'

function registerUserSocketHandlers(socket: Socket): void {
  async function emitInitialUsers(): Promise<void> {
    const users = await listUsers()
    const payload: UsersInitialEvent = {
      type: 'users.initial',
      at: new Date().toISOString(),
      users,
    }

    socket.emit('users.initial', payload)
  }

  emitInitialUsers().catch(error => {
    const message = formatUnknownError(error, 'Failed to send initial users')
    console.error(message)
  })

  socket.on('users:list', async (_payload, callback) => {
    try {
      const users = await listUsers()
      respondWithSuccess(callback, users)
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to list users'))
    }
  })

  socket.on('users:get', async (payload, callback) => {
    try {
      const parsedParams = userIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, formatZodError(parsedParams.error))
        return
      }

      const user = await findUserById(parsedParams.data.id)

      if (!user) {
        respondWithError(callback, 'User not found')
        return
      }

      respondWithSuccess(callback, user)
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to fetch user'))
    }
  })

  socket.on('users:create', async (payload, callback) => {
    try {
      const parsedBody = userCreateSchema.safeParse(payload)
      if (!parsedBody.success) {
        respondWithError(callback, formatZodError(parsedBody.error))
        return
      }

      const user = await createUser(parsedBody.data)
      respondWithSuccess(callback, user)
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to create user'))
    }
  })

  socket.on('users:update', async (payload, callback) => {
    try {
      const parsedParams = userIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, formatZodError(parsedParams.error))
        return
      }

      const parsedBody = userUpdateSchema.safeParse(payload?.data ?? payload?.body ?? {})
      if (!parsedBody.success) {
        respondWithError(callback, formatZodError(parsedBody.error))
        return
      }

      const user = await updateUser(parsedParams.data.id, parsedBody.data)

      if (!user) {
        respondWithError(callback, 'User not found')
        return
      }

      respondWithSuccess(callback, user)
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to update user'))
    }
  })

  socket.on('users:delete', async (payload, callback) => {
    try {
      const parsedParams = userIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, formatZodError(parsedParams.error))
        return
      }

      const deleted = await deleteUser(parsedParams.data.id)

      if (!deleted) {
        respondWithError(callback, 'User not found')
        return
      }

      respondWithSuccess(callback, true)
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to delete user'))
    }
  })
}

export default registerUserSocketHandlers
