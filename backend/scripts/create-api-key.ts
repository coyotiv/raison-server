import 'dotenv/config'
import connection from '../src/lib/database-connection'
import { auth } from '../src/domains/auth/config'
import User from '../src/domains/users/model'

async function ensureDatabaseConnection(): Promise<void> {
  if (connection.readyState === 1) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    connection.once('open', resolve)
    connection.once('error', reject)
  })
}

async function main(): Promise<void> {
  await ensureDatabaseConnection()

  let user = await User.findOne()

  if (!user) {
    user = await User.create({ name: 'API Key Service User' })
  }

  const result = await auth.api.createApiKey({
    body: {
      userId: user._id.toString(),
      name: 'socket-client',
      expiresIn: 60 * 60 * 24 * 7,
    },
  })

  if (!result.key) {
    throw new Error('API key was not generated')
  }

  console.log(result.key)

  await connection.close()
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
