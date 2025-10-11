import { Router, Request, Response, NextFunction } from 'express'
import Prompt from './model'
import Agent from '../agents/model'
import {
  promptListQuerySchema,
  promptCreateSchema,
  promptUpdateSchema,
  promptIdParamSchema,
  PromptListQuery,
  PromptCreateInput,
  PromptUpdateInput,
  PromptIdParams,
} from './validators'

type ErrorResponse = { message: string }

function formatZodErrors(message: string): ErrorResponse {
  return { message }
}

export function createPromptsRouter(): Router {
  const router = Router()

  router.get(
    '/',
    async (
      req: Request<Record<string, never>, unknown, unknown, PromptListQuery>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const parsedQuery = promptListQuerySchema.safeParse(req.query)
        if (!parsedQuery.success) {
          return res.status(400).json(formatZodErrors(parsedQuery.error.flatten().formErrors.join(', ')))
        }

        const { agentId } = parsedQuery.data
        const filter: Record<string, unknown> = {}

        if (agentId !== undefined) {
          filter.agent = agentId
        }

        const prompts = await Prompt.find(filter).sort({ createdAt: -1 })
        return res.json(prompts)
      } catch (error) {
        next(error)
        return undefined
      }
    }
  )

  router.get(
    '/:id',
    async (
      req: Request<PromptIdParams>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const parsedParams = promptIdParamSchema.safeParse(req.params)
        if (!parsedParams.success) {
          return res.status(400).json(formatZodErrors(parsedParams.error.flatten().formErrors.join(', ')))
        }

        const prompt = await Prompt.findById(parsedParams.data.id)

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

  router.post(
    '/',
    async (
      req: Request<Record<string, never>, unknown, PromptCreateInput>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const parsedBody = promptCreateSchema.safeParse(req.body)
        if (!parsedBody.success) {
          return res.status(400).json(formatZodErrors(parsedBody.error.flatten().formErrors.join(', ')))
        }

        const agent = await Agent.findById(parsedBody.data.agentId)

        if (!agent) {
          return res.status(404).json({ message: 'Agent not found' })
        }

        await Prompt.create({
          agent: agent._id,
          systemPrompt: parsedBody.data.systemPrompt,
          ...(parsedBody.data.version ? { version: parsedBody.data.version } : {}),
        })

        const updatedAgent = await Agent.findById(agent._id)

        return res.status(201).json(updatedAgent)
      } catch (error) {
        next(error)
        return undefined
      }
    }
  )

  router.put(
    '/:id',
    async (
      req: Request<PromptIdParams, unknown, PromptUpdateInput>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const parsedParams = promptIdParamSchema.safeParse(req.params)
        if (!parsedParams.success) {
          return res.status(400).json(formatZodErrors(parsedParams.error.flatten().formErrors.join(', ')))
        }

        const parsedBody = promptUpdateSchema.safeParse(req.body)
        if (!parsedBody.success) {
          return res.status(400).json(formatZodErrors(parsedBody.error.flatten().formErrors.join(', ')))
        }

        const prompt = await Prompt.findByIdAndUpdate(parsedParams.data.id, parsedBody.data, {
          new: true,
          runValidators: true,
        })

        if (!prompt) {
          return res.sendStatus(404)
        }

        const updatedAgent = await Agent.findById(prompt.agent)

        return res.json(updatedAgent)
      } catch (error) {
        next(error)
        return undefined
      }
    }
  )

  router.delete(
    '/:id',
    async (
      req: Request<PromptIdParams>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const parsedParams = promptIdParamSchema.safeParse(req.params)
        if (!parsedParams.success) {
          return res.status(400).json(formatZodErrors(parsedParams.error.flatten().formErrors.join(', ')))
        }

        const prompt = await Prompt.findById(parsedParams.data.id)

        if (!prompt) {
          return res.sendStatus(404)
        }

        const agentId = prompt.agent

        await Prompt.findByIdAndDelete(prompt._id)

        const updatedAgent = await Agent.findById(agentId)

        if (!updatedAgent) {
          return res.sendStatus(204)
        }

        return res.json(updatedAgent)
      } catch (error) {
        next(error)
        return undefined
      }
    }
  )

  return router
}

export default createPromptsRouter
