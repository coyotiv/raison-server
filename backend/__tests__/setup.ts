import 'dotenv/config'

import { MongoMemoryReplSet } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { beforeAll, afterAll, jest } from '@jest/globals'

import app from '../src/app'

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

let replset: MongoMemoryReplSet

beforeAll(async () => {
  // This will create an new instance of "MongoMemoryServer" and automatically start it
  replset = await MongoMemoryReplSet.create({ replSet: { count: 4 } })

  const uri = replset.getUri()

  await mongoose.connect(uri)

  // Wait for the connection to be established
  await new Promise(resolve => setTimeout(resolve, 3000))
})

afterAll(async () => {
  await replset.stop()
})

export const api = request(app)
