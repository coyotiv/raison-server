import type { IncomingHttpHeaders } from 'http'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from './config'

export async function getSession(headers: IncomingHttpHeaders): Promise<unknown> {
  return auth.api.getSession({
    headers: fromNodeHeaders(headers),
  })
}

export function getAuthHandler() {
  return auth
}
