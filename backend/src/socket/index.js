const { Server } = require('socket.io')
const { initializeAgentChangeStream } = require('../change-streams')

let ioInstance

function initializeSocket(server, { app } = {}) {
  if (ioInstance) {
    return ioInstance
  }

  ioInstance = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : true,
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
