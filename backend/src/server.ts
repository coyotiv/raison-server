import http from 'http'
import debugModule from 'debug'
import app from './app'
import { initializeSocket } from './lib/socket'
import connection from './lib/database-connection'
import { seedFromFile } from './lib/seed'

const debug = debugModule('backend:server')

function normalizePort(val: string): number | string | false {
  const port = parseInt(val, 10)

  if (Number.isNaN(port)) {
    return val
  }

  if (port >= 0) {
    return port
  }

  return false
}

const port = normalizePort(process.env.PORT || '3000')
if (typeof port === 'number' || typeof port === 'string') {
  app.set('port', port)
}

const server = http.createServer(app)
initializeSocket(server, { app })

function getSeedFileFromArgs(): string | undefined {
  const args = process.argv.slice(2)
  const envFile = process.env.SEED_FILE
  let cliFile: string | undefined
  const idx = args.findIndex((a) => a === '--seedFile' || a === '--seed-file')
  if (idx !== -1 && args[idx + 1]) cliFile = args[idx + 1]
  const eq = args.find((a) => a.startsWith('--seedFile=') || a.startsWith('--seed-file='))
  if (!cliFile && eq) cliFile = eq.split('=')[1]
  return cliFile || envFile
}

async function start(): Promise<void> {
  const seedFile = getSeedFileFromArgs()
  if (seedFile) {
    try {
      if (connection.readyState !== 1) {
        await new Promise<void>((resolve) => {
          connection.once('open', resolve)
        })
      }
      await seedFromFile(seedFile)
      console.log(`[seed] Imported data from ${seedFile}`)
    } catch (error) {
      console.error('[seed] Failed to import data:', error)
      process.exit(1)
    }
  }

  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
}

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

function onListening(): void {
  const addr = server.address()
  if (!addr) {
    return
  }

  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
  debug(`Listening on ${bind}`)
}

start().catch((error) => {
  console.error('[server] Failed to start:', error)
  process.exit(1)
})
