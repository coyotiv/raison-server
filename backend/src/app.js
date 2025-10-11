const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
require('dotenv').config()

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const agentsRouter = require('./routes/agents')

require('./database-connection')

const app = express()

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
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/agents', agentsRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
/* eslint-disable-next-line */
app.use((err, req, res, next) => {
  const error = {
    status: err.status || 500,
    message: err.message,
  }

  if (req.app.get('env') === 'development') {
    error.stack = err.stack
  }

  res.status(error.status)

  res.send(error)
})

module.exports = app
