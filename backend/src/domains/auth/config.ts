import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { apiKey, organization } from 'better-auth/plugins'
import { MongoClient } from 'mongodb'

import config from '@/config'
import { sendEmail } from '@/lib/email/service'

const client = new MongoClient(config.MONGODB_CONNECTION_STRING)
const database = client.db()

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
    organization({
      cancelPendingInvitationsOnReInvite: true,
      invitationLimit: 1,
      teams: {
        enabled: true,
        maximumTeams: 10,
        allowRemovingAllTeams: false,
        defaultTeam: {
          enabled: true,
          name: 'Default Team',
        },
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Please verify your email address',
        template: 'emailVerification',
        props: {
          verifyUrl: url,
          user: {
            name: user.name,
          },
        },
      })
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async session => {
          const member = await database.collection('member').findOne({ userId: session.userId })

          if (member) {
            return {
              data: {
                ...session,
                activeOrganizationId: member.organizationId,
              },
            }
          }

          return {
            data: session,
          }
        },
      },
    },
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
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: false,
    },
  },
  trustedOrigins: config.CORS_ORIGINS,
})
