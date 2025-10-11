/* eslint-disable no-console */
import mongoose from 'mongoose'

const connectionString = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost'

mongoose.set('debug', process.env.NODE_ENV !== 'production')

mongoose
  .connect(connectionString)
  .then(() => console.log('Database connection established.'))
  .catch((error: unknown) => console.error('Database connection failed', error))

export const connection = mongoose.connection

export default connection
