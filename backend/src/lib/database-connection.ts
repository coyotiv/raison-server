import mongoose, { type ClientSession } from 'mongoose'

const connectionString = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost'

mongoose.set('debug', process.env.NODE_ENV !== 'production')

export async function connectToDatabase() {
  return mongoose
    .connect(connectionString)
    .then(() => console.log('Database connection established.'))
    .catch((error: unknown) => console.error('Database connection failed', error))
}

export async function runWithSession<T>(operation: (session: ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const result = await operation(session)
    await session.commitTransaction()
    return result
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}
