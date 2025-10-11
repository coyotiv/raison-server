const { Server } = require('socket.io')
const { initializeAgentChangeStream } = require('../change-streams')

let ioInstance

function initializeSocket(server, { app } = {}) {
  if (ioInstance) {
    return ioInstance
  }

  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost', 'http://localhost:5173']

  ioInstance = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  ioInstance.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`[socket.io] Client connected: ${socket.id}`)

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`[socket.io] Client disconnected: ${socket.id}`)
    })
  })

  if (app) {
    app.set('io', ioInstance)
  }

  initializeAgentChangeStream(ioInstance)

  return ioInstance
}

function getSocket() {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized. Call initializeSocket first.')
  }

  return ioInstance
}

module.exports = { initializeSocket, getSocket }
