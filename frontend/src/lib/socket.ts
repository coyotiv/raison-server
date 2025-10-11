import { io, type Socket } from 'socket.io-client'

type AgentsServerEvents = {
  agents: (payload: {
    operationType: string
    documentKey?: { _id?: string }
    fullDocument?: Record<string, unknown>
    updateDescription?: { updatedFields?: Record<string, unknown>; removedFields?: string[] }
  }) => void
}

type AgentsClientEvents = Record<string, never>

type SocketInstance = Socket<AgentsClientEvents, AgentsServerEvents>

let socket: SocketInstance | null = null

function resolveSocketUrl(): string {
  const explicitUrl = import.meta.env.VITE_SOCKET_URL
  if (explicitUrl) {
    return explicitUrl
  }

  // When running frontend dev server directly (not through Docker)
  if (import.meta.env.DEV && window.location.hostname === 'localhost' && window.location.port === '5173') {
    return 'http://localhost:3000'
  }

  // When running through Docker/Traefik - use api.localhost for both API and Socket.IO
  return 'http://api.localhost'
}

function resolveSocketPath(): string {
  return import.meta.env.VITE_SOCKET_PATH || '/socket.io'
}

export function getSocket(): SocketInstance {
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      path: resolveSocketPath(),
      transports: ['websocket'],
      withCredentials: true,
    })
  }

  return socket
}
