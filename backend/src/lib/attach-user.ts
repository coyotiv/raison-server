import { auth } from '@/domains/auth/config'
import type { RequestHandler } from 'express'

export const attachUser: RequestHandler = async (req, _res, next) => {
  req.user = undefined

  const headersInit = Object.entries(req.headers).map(([key, value]) => [key, value?.toString() ?? '']) as [
    string,
    string,
  ][]

  try {
    const response = await auth.api.getSession({
      headers: new Headers(headersInit),
    })

    if (!response) {
      next()
      return
    }

    const { session, user } = response

    if (user) {
      req.user = user
    }

    if (session) {
      req.session = session
    }

    next()
  } catch (error) {
    // Failed to get user, leave as undefined
    console.error('Failed to get user:', error)
  }
}
