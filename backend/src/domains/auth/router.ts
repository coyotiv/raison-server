import type { Request, Response, NextFunction } from 'express'
import { toNodeHandler } from 'better-auth/node'
import express from 'express'
import { getSession, getAuthHandler } from './service'

export async function getSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
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
