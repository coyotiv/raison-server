import { z } from 'zod'

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MONGODB_CONNECTION_STRING: z.string().default('mongodb://localhost'),
  CORS_ORIGINS: z
    .string()
    .optional()
    .default('http://localhost, http://localhost:5173')
    .transform(val => val.split(',').map(origin => origin.trim())),
  API_KEY: z.string().default('test-api-key'),
  API_KEY_HEADERS: z.string().default('x-api-key'),
  BETTER_AUTH_SECRET: z.string().default('test-secret'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  RESEND_API_KEY: z.string().optional(),
})

const config = configSchema.parse(process.env)

export default config
