import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { apiKey, organization } from 'better-auth/plugins'
import { ensureOrganizationCollections } from './ensure-organization-collections'
import { connection } from '@/lib/database-connection'

const secret = process.env.BETTER_AUTH_SECRET
if (!secret) {
  throw new Error('BETTER_AUTH_SECRET environment variable must be defined')
}

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

const mongoClient = connection.getClient()
const database = mongoClient.db()

ensureOrganizationCollections(database).catch((error: unknown) => {
  console.error('Failed to ensure organization collections', error)
})

export const auth = betterAuth({
  secret,
  baseURL,
  database: mongodbAdapter(database),
  plugins: [
    apiKey({
      rateLimit: {
        enabled: false,
      },
    }),
    organization(),
  ],
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: false,
  },
})
