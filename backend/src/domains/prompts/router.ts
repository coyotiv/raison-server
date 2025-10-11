import { Router, Request, Response, NextFunction } from 'express'
import {
  promptListQuerySchema,
  promptCreateSchema,
  promptUpdateSchema,
  promptIdParamSchema,
  PromptListQuery,
  PromptCreateInput,
  PromptUpdateInput,
  PromptIdParams,
} from './validators.js'
import {
  listPrompts,
  findPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from './service.js'
import { formatZodError } from '@/lib/error-handler.js'

const promptsRouter = Router()

promptsRouter.get(
  '/',
  async (
    req: Request<Record<string, never>, unknown, unknown, PromptListQuery>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const parsedQuery = promptListQuerySchema.safeParse(req.query)
      if (!parsedQuery.success) {
        return res.status(400).json({ message: formatZodError(parsedQuery.error) })
      }

      const prompts = await listPrompts(parsedQuery.data.agentId)
      return res.json(prompts)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

promptsRouter.get(
  '/:id',
  async (
    req: Request<PromptIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const parsedParams = promptIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: formatZodError(parsedParams.error) })
      }

      const prompt = await findPromptById(parsedParams.data.id)

      if (!prompt) {
        return res.sendStatus(404)
      }

      return res.json(prompt)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

promptsRouter.post(
  '/',
  async (
    req: Request<Record<string, never>, unknown, PromptCreateInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const parsedBody = promptCreateSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ message: formatZodError(parsedBody.error) })
      }

      const result = await createPrompt(parsedBody.data)

      if (result.status === 'AGENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Agent not found' })
      }

      return res.status(201).json(result.agent)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

promptsRouter.put(
  '/:id',
  async (
    req: Request<PromptIdParams, unknown, PromptUpdateInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const parsedParams = promptIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: formatZodError(parsedParams.error) })
      }

      const parsedBody = promptUpdateSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({ message: formatZodError(parsedBody.error) })
      }

      const result = await updatePrompt(parsedParams.data.id, parsedBody.data)

      if (result.status === 'PROMPT_NOT_FOUND') {
        return res.sendStatus(404)
      }

      return res.json(result.agent)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

promptsRouter.delete(
  '/:id',
  async (
    req: Request<PromptIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const parsedParams = promptIdParamSchema.safeParse(req.params)
      if (!parsedParams.success) {
        return res.status(400).json({ message: formatZodError(parsedParams.error) })
      }

      const result = await deletePrompt(parsedParams.data.id)

      if (result.status === 'PROMPT_NOT_FOUND') {
        return res.sendStatus(404)
      }

      if (!result.agent) {
        return res.sendStatus(204)
      }

      return res.json(result.agent)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

export default promptsRouter
