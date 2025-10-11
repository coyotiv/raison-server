import { Router, Request, Response, NextFunction } from 'express'
import type { AgentDocument } from './model.js'
import {
  agentCreateSchema,
  agentUpdateSchema,
  agentIdParamSchema,
  agentListQuerySchema,
  agentPromptCreateSchema,
  AgentCreateInput,
  AgentUpdateInput,
  AgentIdParams,
  AgentListQuery,
  AgentPromptCreateInput,
} from './validators.js'
import {
  listAgents,
  findAgentById,
  createAgent,
  updateAgent,
  appendAgentPrompt,
  deleteAgent,
} from './service.js'
import { formatZodError } from '@/lib/error-handler.js'
import { ErrorResponse } from '@/types.js'

const agentsRouter = Router()

agentsRouter.get(
  '/',
  async (
    req: Request<Record<string, never>, AgentDocument[] | ErrorResponse, unknown, AgentListQuery>,
    res: Response<AgentDocument[] | ErrorResponse>,
    next: NextFunction
  ) => {
    try {
      const parsedQuery = agentListQuerySchema.safeParse(req.query)
      if (!parsedQuery.success) {
        return res.status(400).json({ message: formatZodError(parsedQuery.error) })
      }

      const agents = await listAgents(parsedQuery.data.version)
      return res.json(agents as AgentDocument[])
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

agentsRouter.get(
  '/:id',
  async (
    req: Request<AgentIdParams, AgentDocument | ErrorResponse, unknown, AgentListQuery>,
    res: Response<AgentDocument | ErrorResponse>,
    next: NextFunction
  ) => {
    try {
      const parsedParams = agentIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: formatZodError(parsedParams.error) })
      }

      const parsedQuery = agentListQuerySchema.safeParse(req.query)
      if (!parsedQuery.success) {
        return res.status(400).json({ message: formatZodError(parsedQuery.error) })
      }

      const agent = await findAgentById(parsedParams.data.id, parsedQuery.data.version)
      if (!agent) {
        return res.sendStatus(404)
      }

      return res.json(agent as AgentDocument)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

agentsRouter.post(
  '/',
  async (
    req: Request<Record<string, never>, AgentDocument | ErrorResponse, AgentCreateInput>,
    res: Response<AgentDocument | ErrorResponse>,
    next: NextFunction
  ) => {
    try {
      const parsedBody = agentCreateSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ message: formatZodError(parsedBody.error) })
      }

      const agent = await createAgent(parsedBody.data)

      return res.status(201).json(agent as AgentDocument)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

agentsRouter.put(
  '/:id',
  async (
    req: Request<AgentIdParams, AgentDocument | ErrorResponse, AgentUpdateInput>,
    res: Response<AgentDocument | ErrorResponse>,
    next: NextFunction
  ) => {
    try {
      const parsedParams = agentIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: formatZodError(parsedParams.error) })
      }

      const parsedBody = agentUpdateSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ message: formatZodError(parsedBody.error) })
      }

      const agent = await updateAgent(parsedParams.data.id, parsedBody.data)

      if (!agent) {
        return res.sendStatus(404)
      }

      return res.json(agent as AgentDocument)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

agentsRouter.post(
  '/:id/prompts',
  async (
    req: Request<AgentIdParams, AgentDocument | ErrorResponse, AgentPromptCreateInput>,
    res: Response<AgentDocument | ErrorResponse>,
    next: NextFunction
  ) => {
    try {
      const parsedParams = agentIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: formatZodError(parsedParams.error) })
      }

      const parsedBody = agentPromptCreateSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ message: formatZodError(parsedBody.error) })
      }

      const agent = await appendAgentPrompt(parsedParams.data.id, parsedBody.data)

      if (!agent) {
        return res.sendStatus(404)
      }

      return res.status(201).json(agent as AgentDocument)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

agentsRouter.delete(
  '/:id',
  async (
    req: Request<AgentIdParams, void | ErrorResponse>,
    res: Response<void | ErrorResponse>,
    next: NextFunction
  ) => {
    try {
      const parsedParams = agentIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: formatZodError(parsedParams.error) })
      }

      const deleted = await deleteAgent(parsedParams.data.id)

      if (!deleted) {
        return res.sendStatus(404)
      }

      return res.sendStatus(204)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

export default agentsRouter