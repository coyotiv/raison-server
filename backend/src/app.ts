import createError from 'http-errors'
import express, { Application, Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
import { usersRouter } from './domains/users/index.js'
import { agentsRouter } from './domains/agents/index.js'
import { promptsRouter } from './domains/prompts/index.js'
import './lib/database-connection.js'
import authRouter, { getSessionHandler } from './domains/auth/controller.js'

dotenv.config()

const app: Application = express()

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost', 'http://localhost:5173']

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
)

app.use(logger('dev'))
app.use(authRouter)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get('/', (_req: Request, res: Response) => {
  res.render('index', { title: 'Express' })
})

app.get('/ping', (_req: Request, res: Response) => {
  res.sendStatus(200)
})

app.get('/api/me', getSessionHandler)
app.use('/users', usersRouter)
app.use('/agents', agentsRouter)
app.use('/prompts', promptsRouter)

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404))
})

app.use((err: createError.HttpError, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500
  const responseBody: { status: number; message: string; stack?: string } = {
    status,
    message: err.message,
  }

  if (req.app.get('env') === 'development') {
    responseBody.stack = err.stack
  }

  res.status(status).send(responseBody)
})

export default app
