import type { IncomingHttpHeaders } from 'node:http'
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
