import type { User, Session } from 'better-auth'

declare global {
  namespace Express {
    interface Request {
      user: User | undefined
      session: Session | undefined
    }
  }
}
