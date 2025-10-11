import { createAuthClient } from 'better-auth/client'
import { apiKeyClient } from 'better-auth/client/plugins'

const baseURL = import.meta.env.VITE_BETTER_AUTH_URL ?? '/api/auth'

export const authClient = createAuthClient({
  baseURL,
  plugins: [apiKeyClient()],
})

export const { apiKey } = authClient
