import { describe, it, expect, beforeEach } from '@jest/globals'
import mongoose from 'mongoose'
import { api } from './setup'

async function createUser(payload?: { name?: string }) {
  const body = {
    name: payload?.name ?? 'John Doe',
  }

  const res = await api.post('/users').send(body)
  return res
}

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase()
})

describe('Users API', () => {
  describe('POST /users', () => {
    it('creates a user and returns 201', async () => {
      const { status, body } = await createUser()
      expect(status).toBe(201)
      expect(body).toHaveProperty('_id')
      expect(body).toHaveProperty('name', 'John Doe')
    })

    it('returns 400 when validation fails (missing name)', async () => {
      const { status, body } = await api.post('/users').send({})
      expect(status).toBe(400)
      expect(body).toHaveProperty('message')
    })
  })

  describe('GET /users', () => {
    it('returns 200 and an empty list when no users exist', async () => {
      const { status, body } = await api.get('/users')
      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(0)
    })

    it('returns 200 and lists existing users', async () => {
      await createUser({ name: 'Alice' })
      await createUser({ name: 'Bob' })

      const { status, body } = await api.get('/users')
      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(2)
      const names = (body as Array<{ name: string }>).
        map(user => user.name).
        sort()
      expect(names).toEqual(['Alice', 'Bob'])
    })
  })

  describe('GET /users/:id', () => {
    it('returns 200 and the user when found', async () => {
      const created = await createUser({ name: 'Alice' })
      const id = created.body._id

      const { status, body } = await api.get(`/users/${id}`)
      expect(status).toBe(200)
      expect(body).toHaveProperty('_id', id)
      expect(body).toHaveProperty('name', 'Alice')
    })

    it('returns 404 when the user does not exist', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.get(`/users/${nonExistingId}`)
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })
  })

  describe('PUT /users/:id', () => {
    it('updates a user and returns 200', async () => {
      const created = await createUser({ name: 'Alice' })
      const id = created.body._id

      const { status, body } = await api.put(`/users/${id}`).send({ name: 'Updated Alice' })
      expect(status).toBe(200)
      expect(body).toHaveProperty('_id', id)
      expect(body).toHaveProperty('name', 'Updated Alice')
    })

    it('returns 404 when updating a non-existing user', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.put(`/users/${nonExistingId}`).send({ name: 'X' })
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })

    it('returns 400 when validation fails (empty body)', async () => {
      const created = await createUser({ name: 'Alice' })
      const id = created.body._id

      const { status, body } = await api.put(`/users/${id}`).send({})
      expect(status).toBe(400)
      expect(body).toHaveProperty('message')
    })
  })

  describe('DELETE /users/:id', () => {
    it('deletes a user and returns 204', async () => {
      const created = await createUser({ name: 'ToDelete' })
      const id = created.body._id

      const delRes = await api.delete(`/users/${id}`)
      expect(delRes.status).toBe(204)

      const getRes = await api.get(`/users/${id}`)
      expect(getRes.status).toBe(404)
    })

    it('returns 404 when deleting a non-existing user', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.delete(`/users/${nonExistingId}`)
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })
  })
})


