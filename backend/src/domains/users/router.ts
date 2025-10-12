import { validate } from 'echt'
import { Router } from 'express'

import { listUsers, findUserById, createUser, updateUser, deleteUser } from './service'
import { listUsersRequest, getUserRequest, deleteUserRequest, updateUserRequest, createUserRequest } from './validators'

const usersRouter = Router()

usersRouter.get(
  '/',
  validate(listUsersRequest).use(async (_req, res, next) => {
    try {
      const users = await listUsers()
      res.json(users)
    } catch (error) {
      next(error)
    }
  })
)

usersRouter.get(
  '/:id',
  validate(getUserRequest).use(async (req, res, next) => {
    try {
      const user = await findUserById(req.params.id)

      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      res.json(user)
    } catch (error) {
      next(error)
    }
  })
)

usersRouter.post(
  '/',
  validate(createUserRequest).use(async (req, res, next) => {
    try {
      const user = await createUser(req.body)

      res.status(201).json(user)
    } catch (error) {
      next(error)
    }
  })
)

usersRouter.put(
  '/:id',
  validate(updateUserRequest).use(async (req, res, next) => {
    try {
      const user = await updateUser(req.params.id, req.body)

      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      res.json(user)
    } catch (error) {
      next(error)
    }
  })
)

usersRouter.delete(
  '/:id',
  validate(deleteUserRequest).use(async (req, res, next) => {
    try {
      const deleted = await deleteUser(req.params.id)

      if (!deleted) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      res.status(204).json(null)
    } catch (error) {
      next(error)
    }
  })
)

export default usersRouter
