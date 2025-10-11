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

  // When running through Docker/Traefik or production
  return `${window.location.protocol}//${window.location.host}`
}

function resolveSocketPath(): string {
  if (import.meta.env.VITE_SOCKET_PATH) {
    return import.meta.env.VITE_SOCKET_PATH
  }

  // Direct connection to backend (dev mode) - backend socket.io path is /socket.io
  if (import.meta.env.DEV && window.location.hostname === 'localhost' && window.location.port === '5173') {
    return '/socket.io'
  }

  // Through Traefik - request /api/socket.io, Traefik strips /api, backend receives /socket.io
  return '/api/socket.io'
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
