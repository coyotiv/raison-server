import { Router, Request, Response, NextFunction } from 'express'
import User from './model'
import { userCreateSchema, UserCreateInput } from './validators'

const usersRouter = Router()

usersRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.post('/', async (req: Request<Record<string, never>, unknown, UserCreateInput>, res: Response, next: NextFunction) => {
  try {
    const parsedBody = userCreateSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ message: parsedBody.error.flatten().formErrors.join(', ') })
    }

    const user = await User.create({ name: parsedBody.data.name })
    return res.status(201).json(user)
  } catch (error) {
    next(error)
    return undefined
  }
})

export { usersRouter }
export default usersRouter
