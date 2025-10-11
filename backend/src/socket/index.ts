import type { Server as HTTPServer } from 'http'
import type { Application } from 'express'
import { Server, Socket } from 'socket.io'
import Agent from '../domains/agents/model'
import type { AgentDocument } from '../domains/agents/model'
import { initializeChangeStreams, handleSocketConnection } from '../change-streams'
import type { SocketAuth } from '../types'

let ioInstance: Server | null = null

type InitializeSocketOptions = {
  app?: Application
}

export function initializeSocket(server: HTTPServer, { app }: InitializeSocketOptions = {}): Server {
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

  ioInstance.use((socket: Socket, next) => {
    const { apiKey } = (socket.handshake.auth || {}) as SocketAuth
    const expectedApiKey = process.env.API_KEY

    if (expectedApiKey && apiKey !== expectedApiKey) {
      console.log(`[socket.io] Authentication failed for socket ${socket.id}`)
      next(new Error('Authentication failed'))
      return
    }

    console.log(`[socket.io] Authentication successful for socket ${socket.id}`)
    next()
  })

  ioInstance.on('connection', async (socket: Socket) => {
    console.log(`[socket.io] Client connected: ${socket.id}`)

    await handleSocketConnection(socket)

    socket.on('disconnect', () => {
      console.log(`[socket.io] Client disconnected: ${socket.id}`)
    })
  })

  if (app) {
    app.set('io', ioInstance)
  }

  initializeChangeStreams(ioInstance)

  return ioInstance
}

export function getSocket(): Server {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized. Call initializeSocket first.')
  }

  return ioInstance
}

export async function broadcastAgents(): Promise<void> {
  if (!ioInstance) {
    return
  }

  const agents = await Agent.find()
  const payload = agents.map((agent: AgentDocument) => agent.toJSON())
  ioInstance.emit('agents', payload)
}
