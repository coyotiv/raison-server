import { describe, it, expect } from '@jest/globals'
import { api } from './setup'

describe('Ping', () => {
  it('GET /ping returns 200', async () => {
    const { status } = await api.get('/ping')
    expect(status).toBe(200)
  })
})
