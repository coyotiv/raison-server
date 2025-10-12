import { toNodeHandler } from 'better-auth/node'
import express, { type RequestHandler } from 'express'

import { getSession, getAuthHandler } from './service'

export const getSessionHandler: RequestHandler = async (req, res, next) => {
  try {
    const session = await getSession(req.headers)

    res.json(session)
  } catch (error) {
    next(error)
  }
}

const authRouter = express.Router()
authRouter.all('/api/auth/{*any}', toNodeHandler(getAuthHandler()))

export default authRouter
