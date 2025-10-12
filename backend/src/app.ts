import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import logger from 'morgan'

import config from './config'
import agentsRouter from './domains/agents/router'
import { auth } from './domains/auth/config'
import promptsRouter from './domains/prompts/router'
import { errorHandler } from './lib/error-handler'

const app = express()

app.set('trust proxy', 1)

app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
)

app.use(logger('tiny'))

app.all('/api/auth/*', toNodeHandler(auth))

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get('/ping', (_req, res) => {
  res.sendStatus(200)
})

app.use('/agents', agentsRouter)
app.use('/prompts', promptsRouter)

app.use(errorHandler)

export default app
