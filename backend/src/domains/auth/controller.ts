import type { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from './config.js'
import { toNodeHandler } from 'better-auth/node'
import express from 'express'

export async function getSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    res.json(session)
  } catch (error) {
    next(error)
  }
}

const authRouter = express.Router()
authRouter.all('/api/auth/{*any}', toNodeHandler(auth))

export default authRouter
