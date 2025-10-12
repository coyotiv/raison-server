import { describe, it, expect, beforeEach } from '@jest/globals'
import mongoose from 'mongoose'
import { api } from './setup'

async function createAgent(payload?: { name?: string; prompts?: Array<{ systemPrompt: string; version?: string }> }) {
  const body = {
    name: payload?.name ?? 'Test Agent',
    prompts: payload?.prompts ?? [
      {
        systemPrompt: 'You are a helpful assistant.',
      },
    ],
  }

  const res = await api.post('/agents').send(body)
  return res
}

beforeEach(async () => {
  // Reset database state for isolation between tests
  await mongoose.connection.db.dropDatabase()
})

describe('Agents API', () => {
  describe('POST /agents', () => {
    it('creates an agent and returns 201', async () => {
      const { status, body } = await createAgent()

      expect(status).toBe(201)
      console.log('TEST body createAgent', body)
      expect(body).toHaveProperty('_id')
      expect(body).toHaveProperty('name', 'Test Agent')
      expect(body).toHaveProperty('systemPrompt', 'You are a helpful assistant.')
      expect(Array.isArray(body.prompts)).toBe(true)
      expect(body.prompts.length).toBe(1)
      expect(body.prompts[0]).toHaveProperty('systemPrompt', 'You are a helpful assistant.')
    })

    it('returns 400 when validation fails (missing name and prompts empty)', async () => {
      const { status, body } = await api.post('/agents').send({ name: '', prompts: [] })

      expect(status).toBe(400)
      expect(body).toHaveProperty('message')
    })
  })

  describe('GET /agents', () => {
    it('returns 200 and an empty list when no agents exist', async () => {
      const { status, body } = await api.get('/agents')
      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(0)
    })

    it('returns 200 and lists existing agents', async () => {
      await createAgent({ name: 'A1' })
      await createAgent({ name: 'A2' })

      const { status, body } = await api.get('/agents')
      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(2)
      const names = (body as Array<{ name: string }>).map(a => a.name).sort()
      expect(names).toEqual(['A1', 'A2'])
      ;(body as Array<{ systemPrompt?: string }>).forEach(agent => {
        expect(agent).toHaveProperty('systemPrompt', 'You are a helpful assistant.')
      })
    })

    it('returns 400 on invalid query (tag provided as array)', async () => {
      const { status, body } = await api.get('/agents').query({ tag: ['v1', 'v2'] as unknown as string })
      expect(status).toBe(400)
      expect(body).toHaveProperty('message')
    })
  })

  describe('GET /agents/:id', () => {
    it('returns 200 and the agent when found', async () => {
      const created = await createAgent()
      const id = created.body._id

      const { status, body } = await api.get(`/agents/${id}`)
      expect(status).toBe(200)
      expect(body).toHaveProperty('_id', id)
      expect(body).toHaveProperty('name')
      expect(body).toHaveProperty('systemPrompt', 'You are a helpful assistant.')
    })

    it('returns 404 when the agent does not exist', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.get(`/agents/${nonExistingId}`)
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })

    it('returns 400 when the id is invalid', async () => {
      const { status, body } = await api.get('/agents/not-a-valid-id')
      expect(status).toBe(400)
      expect(body).toHaveProperty('message')
    })
  })

  describe('PUT /agents/:id', () => {
    it('updates an agent and returns 200', async () => {
      const created = await createAgent({ name: 'Original' })
      const id = created.body._id

      const updatePayload = {
        name: 'Updated Name',
        prompts: [{ systemPrompt: 'P1' }, { systemPrompt: 'P2' }],
      }

      const { status, body } = await api.put(`/agents/${id}`).send(updatePayload)
      expect(status).toBe(200)
      expect(body).toHaveProperty('_id', id)
      expect(body).toHaveProperty('name', 'Updated Name')
      expect(Array.isArray(body.prompts)).toBe(true)
      expect(body.prompts.length).toBe(2)
    })

    it('returns 404 when updating a non-existing agent', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.put(`/agents/${nonExistingId}`).send({ name: 'X' })
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })

      it('returns 400 when validation fails (missing name)', async () => {
        const created = await createAgent()
        const id = created.body._id
        const { status, body } = await api.put(`/agents/${id}`).send({})
        expect(status).toBe(400)
        expect(body).toHaveProperty('message')
      })
  })

  describe('POST /agents/:id/prompts', () => {
    it('appends a prompt and returns 200', async () => {
      const created = await createAgent({ prompts: [{ systemPrompt: 'Initial' }] })
      const id = created.body._id

      const { status, body } = await api
        .post(`/agents/${id}/prompts`)
        .send({ systemPrompt: 'Additional prompt' })

      expect(status).toBe(200)
      expect(body).toHaveProperty('_id', id)
      expect(Array.isArray(body.prompts)).toBe(true)
      expect(body.prompts.length).toBe(2)
      const promptsTexts = (body.prompts as Array<{ systemPrompt: string }>).map(p => p.systemPrompt)
      expect(promptsTexts).toEqual(expect.arrayContaining(['Initial', 'Additional prompt']))
      expect(body).toHaveProperty('systemPrompt', 'Additional prompt')
    })

    it('returns 404 when agent is not found', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status } = await api.post(`/agents/${nonExistingId}/prompts`).send({ systemPrompt: 'X' })

      expect(status).toBe(404)
    })

    it('returns 400 when validation fails (missing systemPrompt)', async () => {
      const created = await createAgent()
      const id = created.body._id
      const { status, body } = await api.post(`/agents/${id}/prompts`).send({})
      expect(status).toBe(400)
      expect(body).toHaveProperty('message')
    })
  })

  describe('DELETE /agents/:id', () => {
    it('deletes an agent and returns 204', async () => {
      const created = await createAgent()
      const id = created.body._id

      const deleteRes = await api.delete(`/agents/${id}`)
      expect(deleteRes.status).toBe(204)

      const getRes = await api.get(`/agents/${id}`)
      expect(getRes.status).toBe(404)
    })

    it('returns 404 when deleting a non-existing agent', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.delete(`/agents/${nonExistingId}`)
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })
  })
})
