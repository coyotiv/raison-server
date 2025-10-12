import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'

import config from './config'
import usersRouter from './domains/users/router'
import agentsRouter from './domains/agents/router'
import promptsRouter from './domains/prompts/router'
import { errorHandler } from './lib/error-handler'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './domains/auth/config'

const app = express()

app.set('trust proxy', 1)

app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
)

app.use(logger('dev'))

app.all('/api/auth/*', toNodeHandler(auth))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get('/ping', (_req, res) => {
  res.sendStatus(200)
})

app.use('/users', usersRouter)
app.use('/agents', agentsRouter)
app.use('/prompts', promptsRouter)

app.use(errorHandler)

export default app
