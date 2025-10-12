import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'

import config from './config'
import authRouter, { getSessionHandler } from './domains/auth/router'
import usersRouter from './domains/users/router'
import agentsRouter from './domains/agents/router'
import promptsRouter from './domains/prompts/router'
import { errorHandler } from './lib/error-handler'

const app = express()

const allowedOrigins = config.CORS_ORIGINS.length > 0 ? config.CORS_ORIGINS : []

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

app.get('/', (_req, res) => {
  res.render('index', { title: 'Express' })
})

app.get('/ping', (_req, res) => {
  res.sendStatus(200)
})

app.get('/api/me', getSessionHandler)
app.use('/users', usersRouter)
app.use('/agents', agentsRouter)
app.use('/prompts', promptsRouter)

app.use(errorHandler)

export default app
