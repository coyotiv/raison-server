import mongoose from 'mongoose'

const connectionString = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost'

mongoose.set('debug', process.env.NODE_ENV !== 'production')

export async function connectToDatabase() {
  return mongoose
    .connect(connectionString)
    .then(() => console.log('Database connection established.'))
    .catch((error: unknown) => console.error('Database connection failed', error))
}
