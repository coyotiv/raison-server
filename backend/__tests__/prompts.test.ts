import { describe, it, expect, beforeEach } from '@jest/globals'
import mongoose from 'mongoose'
import { api } from './setup'

async function createAgent(payload?: { name?: string }) {
  const res = await api.post('/agents').send({
    name: payload?.name ?? 'Agent for Prompts',
    prompts: [{ systemPrompt: 'Initial system prompt' }],
  })
  return res
}

async function createPrompt(payload: { agentId: string; systemPrompt?: string; tags?: string[] }) {
  const res = await api.post('/prompts').send({
    agentId: payload.agentId,
    systemPrompt: payload.systemPrompt ?? 'New system prompt',
    ...(payload.tags ? { tags: payload.tags } : {}),
  })
  return res
}

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase()
})

describe('Prompts API', () => {
  describe('POST /prompts', () => {
    it('creates a prompt for an existing agent (201) with tags applied', async () => {
      const agent = await createAgent()
      const agentId = agent.body._id

      const { status, body } = await createPrompt({ agentId, systemPrompt: 'SP1', tags: ['  tag1 ', 'tag2', 'tag1'] })
      expect(status).toBe(201)
      expect(body).toHaveProperty('_id')
      expect(body).toHaveProperty('agent')
      expect(body).toHaveProperty('systemPrompt', 'SP1')
      expect(Array.isArray(body.tags)).toBe(true)
      // normalized unique trimmed tags
      expect(body.tags.sort()).toEqual(['tag1', 'tag2'])
    })

    it('returns 404 when agentId does not exist', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.post('/prompts').send({ agentId: nonExistingId, systemPrompt: 'X' })
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })

    it('returns 400 when validation fails (missing agentId/systemPrompt)', async () => {
      const { status, body } = await api.post('/prompts').send({})
      expect(status).toBe(400)
      expect(body).toHaveProperty('message')
    })
  })

  describe('GET /prompts', () => {
    it('returns an empty list when no prompts exist (200)', async () => {
      const { status, body } = await api.get('/prompts')
      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(0)
    })

    it('lists prompts with and without agentId filter (200)', async () => {
      const agent1 = await createAgent({ name: 'A1' })
      const agent2 = await createAgent({ name: 'A2' })

      await createPrompt({ agentId: agent1.body._id, systemPrompt: 'A1-P1', tags: ['alpha'] })
      await createPrompt({ agentId: agent2.body._id, systemPrompt: 'A2-P1', tags: ['beta'] })

      const all = await api.get('/prompts')
      expect(all.status).toBe(200)
      expect(all.body.length).toBe(4) // includes initial prompts created with agents

      const a1Only = await api.get('/prompts').query({ agentId: agent1.body._id })
      expect(a1Only.status).toBe(200)
      const a1Ids = (a1Only.body as Array<{ agent: string }>).map(p => String(p.agent))
      expect(a1Ids.every(id => id === agent1.body._id)).toBe(true)
    })
  })

  describe('GET /prompts/:id', () => {
    it('returns the prompt when found (200)', async () => {
      const agent = await createAgent()
      const promptRes = await createPrompt({ agentId: agent.body._id, systemPrompt: 'Find me', tags: ['find'] })
      const id = promptRes.body._id

      const { status, body } = await api.get(`/prompts/${id}`)
      expect(status).toBe(200)
      expect(body).toHaveProperty('_id', id)
      expect(body).toHaveProperty('systemPrompt', 'Find me')
      expect(body.tags).toEqual(['find'])
    })

    it('returns 404 when prompt does not exist', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.get(`/prompts/${nonExistingId}`)
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })
  })

  describe('PUT /prompts/:id', () => {
    it('updates a prompt and returns 200', async () => {
      const agent = await createAgent()
      const created = await createPrompt({ agentId: agent.body._id, systemPrompt: 'Old', tags: ['old'] })
      const id = created.body._id

      const { status, body } = await api.put(`/prompts/${id}`).send({ systemPrompt: 'New', tags: ['  new ', 'new', 'other'] })
      expect(status).toBe(200)
      expect(body).toHaveProperty('_id', id)
      expect(body).toHaveProperty('systemPrompt', 'New')
      expect(body.tags.sort()).toEqual(['new', 'other'])
    })

    it('returns 404 when updating a non-existing prompt', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.put(`/prompts/${nonExistingId}`).send({ systemPrompt: 'X' })
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })

    it('returns 400 when validation fails (empty body)', async () => {
      const agent = await createAgent()
      const created = await createPrompt({ agentId: agent.body._id, systemPrompt: 'Old' })
      const id = created.body._id

      const { status, body } = await api.put(`/prompts/${id}`).send({})
      expect(status).toBe(400)
      expect(body).toHaveProperty('message')
    })

    it('increments version and records revision when prompt is updated', async () => {
      const agent = await createAgent()
      const created = await createPrompt({ agentId: agent.body._id, systemPrompt: 'Initial version' })
      const id = created.body._id
      const initialVersion = created.body.version

      const updated = await api.put(`/prompts/${id}`).send({ systemPrompt: 'Updated version' })
      expect(updated.status).toBe(200)
      expect(updated.body).toHaveProperty('version', initialVersion + 1)

      const history = await api.get(`/prompts/${id}/history`)
      expect(history.status).toBe(200)
      expect(Array.isArray(history.body)).toBe(true)
      const versions = (history.body as Array<{ version: number }>).map(entry => entry.version)
      expect(versions).toContain(initialVersion)
      expect(versions).toContain(initialVersion + 1)
    })
  })

  describe('DELETE /prompts/:id', () => {
    it('deletes a prompt and returns 204', async () => {
      const agent = await createAgent()
      const created = await createPrompt({ agentId: agent.body._id, systemPrompt: 'To delete' })
      const id = created.body._id

      const delRes = await api.delete(`/prompts/${id}`)
      expect(delRes.status).toBe(204)

      const getRes = await api.get(`/prompts/${id}`)
      expect(getRes.status).toBe(404)
    })

    it('returns 404 when deleting a non-existing prompt', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString()
      const { status, body } = await api.delete(`/prompts/${nonExistingId}`)
      expect(status).toBe(404)
      expect(body).toHaveProperty('message')
    })

    it('updates agent systemPrompt when deleting the latest prompt', async () => {
      const agent = await createAgent({ name: 'Agent Delete Sync' })
      const agentId = agent.body._id

      const prompt1 = await createPrompt({ agentId, systemPrompt: 'Primary' })
      const prompt2 = await createPrompt({ agentId, systemPrompt: 'Secondary' })

      expect(prompt1.status).toBe(201)
      expect(prompt2.status).toBe(201)

      const agentBeforeDelete = await api.get(`/agents/${agentId}`)
      expect(agentBeforeDelete.status).toBe(200)
      expect(agentBeforeDelete.body.systemPrompt).toBe('Secondary')

      const delRes = await api.delete(`/prompts/${prompt2.body._id}`)
      expect(delRes.status).toBe(204)

      const agentAfterDelete = await api.get(`/agents/${agentId}`)
      expect(agentAfterDelete.status).toBe(200)
      expect(agentAfterDelete.body.systemPrompt).toBe('Primary')
    })
  })

  describe('POST /prompts/:id/restore/:version', () => {
    it('restoring a version updates agent systemPrompt to restored text', async () => {
      const agent = await createAgent({ name: 'Agent Restore Sync' })
      const agentId = agent.body._id

      const prompt = await createPrompt({ agentId, systemPrompt: 'Initial' })
      const promptId = prompt.body._id

      await api.put(`/prompts/${promptId}`).send({ systemPrompt: 'Updated once' })
      const secondUpdate = await api.put(`/prompts/${promptId}`).send({ systemPrompt: 'Updated twice' })
      expect(secondUpdate.status).toBe(200)

      const agentAfterUpdates = await api.get(`/agents/${agentId}`)
      expect(agentAfterUpdates.status).toBe(200)
      expect(agentAfterUpdates.body.systemPrompt).toBe('Updated twice')

      const restoreRes = await api.post(`/prompts/${promptId}/restore/1`)
      expect(restoreRes.status).toBe(200)

      const agentAfterRestore = await api.get(`/agents/${agentId}`)
      expect(agentAfterRestore.status).toBe(200)
      expect(agentAfterRestore.body.systemPrompt).toBe('Initial')
    })
  })
})


