import type { Server as HTTPServer } from 'http'
import type { Application } from 'express'
import { Server, Socket } from 'socket.io'
import Agent from '../domains/agents/model.js'
import type { AgentDocument } from '../domains/agents/model.js'
import { initializeChangeStreams, handleSocketConnection } from './change-streams.js'
import type { SocketAuth } from '../types.js'
import { auth } from '../domains/auth/config.js'
import { fromNodeHeaders } from 'better-auth/node'

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

  const apiKeyHeaderNames = process.env.API_KEY_HEADERS
    ? process.env.API_KEY_HEADERS.split(',').map((header) => header.trim().toLowerCase())
    : ['x-api-key']

  ioInstance.use(async (socket: Socket, next) => {
    try {
      const { apiKey } = (socket.handshake.auth || {}) as SocketAuth

      const headerKey = apiKeyHeaderNames
        .map((headerName) => socket.handshake.headers[headerName])
        .map((raw) => (Array.isArray(raw) ? raw[0] : raw))
        .find((value): value is string => typeof value === 'string' && value.length > 0)

      const fallbackKey = process.env.API_KEY
      const providedKey = apiKey ?? headerKey ?? fallbackKey

      if (providedKey) {
        const verification = await auth.api.verifyApiKey({
          body: {
            key: providedKey,
          },
        })

        if (!verification.valid || !verification.key) {
          const message = verification.error?.message ?? 'Invalid API key'
          console.log(`[socket.io] Authentication failed for socket ${socket.id}: ${message}`)
          next(new Error(message))
          return
        }

        socket.data.apiKey = verification.key
        console.log(`[socket.io] Authentication successful for socket ${socket.id} using API key`)
        next()
        return
      }

      const headers = fromNodeHeaders(socket.handshake.headers)
      const session = await auth.api.getSession({ headers })

      if (!session) {
        console.log(`[socket.io] Authentication failed for socket ${socket.id}: No API key or session`)
        next(new Error('Authentication required'))
        return
      }

      socket.data.session = session
      console.log(`[socket.io] Authentication successful for socket ${socket.id} using session`)
      next()
    } catch (error) {
      console.error(`[socket.io] Error verifying API key for socket ${socket.id}:`, error)
      next(error instanceof Error ? error : new Error('Failed to verify API key'))
    }
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
  const payload = {
    type: 'agents.initial',
    at: new Date().toISOString(),
    agents: agents.map((agent: AgentDocument) => agent.toJSON()),
  }
  ioInstance.emit('agents.initial', payload)
}
