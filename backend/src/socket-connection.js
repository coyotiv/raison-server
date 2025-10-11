const { Server } = require('socket.io')

let socketServer = null

module.exports = (app, server) => {
  if (socketServer) return socketServer

  socketServer = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : true,
      credentials: true,
    },
  })

  socketServer.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`[socket.io] Client connected: ${socket.id}`)

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`[socket.io] Client disconnected: ${socket.id}`)
    })
  })

  return socketServer
}
