export type SocketAck<T = unknown> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string }

export type SocketAckCallback<T = unknown> = (response: SocketAck<T>) => void

export function isSocketAckCallback<T = unknown>(callback: unknown): callback is SocketAckCallback<T> {
  return typeof callback === 'function'
}

export function respondWithSuccess<T>(callback: unknown, data: T): void {
  if (isSocketAckCallback<T>(callback)) {
    callback({ status: 'ok', data })
  }
}

export function respondWithError(callback: unknown, message: string): void {
  if (isSocketAckCallback(callback)) {
    callback({ status: 'error', message })
  }
}

export function formatUnknownError(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}
