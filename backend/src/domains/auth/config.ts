import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { apiKey, organization } from 'better-auth/plugins'
import { MongoClient } from 'mongodb'

// import { ensureOrganizationCollections } from './ensure-organization-collections'

import config from '@/config'

const client = new MongoClient(config.MONGODB_CONNECTION_STRING)
const database = client.db()

// ensureOrganizationCollections(database).catch((error: unknown) => {
//   console.error('Failed to ensure organization collections', error)
// })

export const auth = betterAuth({
  appName: 'Raison',
  secret: config.BETTER_AUTH_SECRET,
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
  socialProviders: {
    google: {
      enabled: true,
      prompt: 'select_account',
      scope: ['email', 'profile'],
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
  },
  rateLimit: {
    enabled: false,
  },
  trustedOrigins: config.CORS_ORIGINS,
})
