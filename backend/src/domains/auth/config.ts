import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { apiKey, organization } from 'better-auth/plugins'
import mongoose from 'mongoose'

// import { ensureOrganizationCollections } from './ensure-organization-collections'

import config from '@/config'

const client = mongoose.connection.getClient()
const database = client?.db()

// ensureOrganizationCollections(database).catch((error: unknown) => {
//   console.error('Failed to ensure organization collections', error)
// })

export const auth = betterAuth({
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,
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
