import { validate } from 'echt'
import { Router } from 'express'

import {
  listAgentsRequest,
  getAgentRequest,
  createAgentRequest,
  updateAgentRequest,
  deleteAgentRequest,
  addPromptToAgentRequest,
} from './validators'
import { listAgents, findAgentById, createAgent, updateAgent, appendAgentPrompt, deleteAgent } from './service'

const agentsRouter = Router()

agentsRouter.get(
  '/',
  validate(listAgentsRequest).use(async (req, res, next) => {
    try {
      const agents = await listAgents(req.query.tag)

      res.json(agents)
    } catch (error) {
      next(error)
    }
  })
)

agentsRouter.get(
  '/:id',
  validate(getAgentRequest).use(async (req, res, next) => {
    try {
      const agent = await findAgentById(req.params.id, req.query.tag)

      if (!agent) {
        res.status(404).json({ message: 'Agent not found' })
        return
      }

      res.json(agent)
    } catch (error) {
      next(error)
    }
  })
)

agentsRouter.post(
  '/',
  validate(createAgentRequest).use(async (req, res, next) => {
    try {
      const agent = await createAgent(req.body)

      if (!agent) {
        res.status(500).json({ message: 'Failed to create agent' })
        return
      }

      res.status(201).json(agent)
    } catch (error) {
      next(error)
    }
  })
)

agentsRouter.put(
  '/:id',
  validate(updateAgentRequest).use(async (req, res, next) => {
    try {
      const agent = await updateAgent(req.params.id, req.body)

      if (!agent) {
        res.status(404).json({ message: 'Agent not found' })
        return
      }

      res.json(agent)
    } catch (error) {
      next(error)
    }
  })
)

agentsRouter.post(
  '/:id/prompts',
  validate(addPromptToAgentRequest).use(async (req, res, next) => {
    try {
      const agent = await appendAgentPrompt(req.params.id, req.body)

      if (!agent) {
        res.status(404).json({ message: 'Agent not found' })
        return
      }

      res.json(agent)
    } catch (error) {
      next(error)
    }
  })
)

agentsRouter.delete(
  '/:id',
  validate(deleteAgentRequest).use(async (req, res, next) => {
    try {
      const deleted = await deleteAgent(req.params.id)

      if (!deleted) {
        res.status(404).json({ message: 'Agent not found' })
        return
      }

      res.status(204).json(null)
    } catch (error) {
      next(error)
    }
  })
)

export default agentsRouter
