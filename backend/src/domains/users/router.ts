import { Router, Request, Response, NextFunction } from 'express'
import type { Socket } from 'socket.io'
import {
  userCreateSchema,
  userUpdateSchema,
  userIdParamSchema,
  UserCreateInput,
  UserUpdateInput,
  UserIdParams,
} from './validators.js'
import {
  listUsers,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
} from './service.js'
import { respondWithError, respondWithSuccess, formatUnknownError } from '../shared/socket.js'
import { toUserPayload } from '../shared/serialization.js'
import type { UsersInitialEvent } from '../../types.js'

const usersRouter = Router()

usersRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await listUsers()
    res.json(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get(
  '/:id',
  async (req: Request<UserIdParams>, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const parsedParams = userIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
      }

      const user = await findUserById(parsedParams.data.id)

      if (!user) {
        return res.sendStatus(404)
      }

      return res.json(user)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

usersRouter.post(
  '/',
  async (req: Request<Record<string, never>, unknown, UserCreateInput>, res: Response, next: NextFunction) => {
    try {
      const parsedBody = userCreateSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ message: parsedBody.error.flatten().formErrors.join(', ') })
      }

      const user = await createUser(parsedBody.data)
      return res.status(201).json(user)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

usersRouter.put(
  '/:id',
  async (
    req: Request<UserIdParams, unknown, UserUpdateInput>,
    res: Response,
    next: NextFunction
  ): Promise<Response | undefined> => {
    try {
      const parsedParams = userIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
      }

      const parsedBody = userUpdateSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ message: parsedBody.error.flatten().formErrors.join(', ') })
      }

      const user = await updateUser(parsedParams.data.id, parsedBody.data)

      if (!user) {
        return res.sendStatus(404)
      }

      return res.json(user)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

usersRouter.delete(
  '/:id',
  async (req: Request<UserIdParams>, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const parsedParams = userIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
      }

      const deleted = await deleteUser(parsedParams.data.id)

      if (!deleted) {
        return res.sendStatus(404)
      }

      return res.sendStatus(204)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

export default usersRouter
