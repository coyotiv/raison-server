import { Router, Request, Response, NextFunction } from 'express'
import mongoose, { ClientSession } from 'mongoose'
import { ZodError } from 'zod'
import Agent from './model.js'
import Prompt from '../prompts/model.js'
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

type ErrorResponse = { message: string }

function formatZodError(error: ZodError<unknown>): string {
  const { formErrors, fieldErrors } = error.flatten()
  const fieldMessages = Object.entries(fieldErrors ?? {}).flatMap(([field, messages]) => {
    const currentMessages: string[] = Array.isArray(messages) ? messages : []
    return currentMessages.map((message) => `${field}: ${message}`)
  })

  return [...(formErrors ?? []), ...fieldMessages].join(', ')
}

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

      const { version } = parsedQuery.data

      if (version !== undefined) {
        const agents = await Agent.find({}, null, { autopopulate: false }).populate({
          path: 'prompts',
          match: { version },
        })
        return res.json(agents as AgentDocument[])
      }

      const agents = await Agent.find()
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

      const { id } = parsedParams.data
      const { version } = parsedQuery.data

      if (version !== undefined) {
        const agent = await Agent.findById(id, null, { autopopulate: false }).populate({
          path: 'prompts',
          match: { version },
        })
        if (!agent) {
          return res.sendStatus(404)
        }
        return res.json(agent as AgentDocument)
      }

      const agent = await Agent.findById(id)
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

      const session = await mongoose.startSession()
      session.startTransaction()

      try {
        const [agent] = await Agent.create([{ name: parsedBody.data.name }], { session })

        const promptsToCreate = parsedBody.data.prompts.map((prompt: AgentPromptCreateInput) => ({
          agent: agent._id,
          systemPrompt: prompt.systemPrompt,
          ...(prompt.version ? { version: prompt.version } : {}),
        }))

        const createdPrompts = await Prompt.create(promptsToCreate, { session })
        agent.prompts = createdPrompts.map((prompt) => prompt._id)

        await agent.save({ session })

        await session.commitTransaction()

        const populatedAgent = await Agent.findById(agent._id)

        return res.status(201).json(populatedAgent as AgentDocument)
      } catch (error) {
        await session.abortTransaction()
        next(error)
        return undefined
      } finally {
        await session.endSession()
      }
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

      const session: ClientSession = await mongoose.startSession()
      session.startTransaction()

      try {
        const agent = await Agent.findById(parsedParams.data.id).session(session)

        if (!agent) {
          await session.abortTransaction()
          return res.sendStatus(404)
        }

        agent.name = parsedBody.data.name

        if (parsedBody.data.prompts) {
          await Prompt.deleteMany({ agent: agent._id }).session(session)

          const createdPrompts = await Prompt.create(
            parsedBody.data.prompts.map((prompt) => ({
              agent: agent._id,
              systemPrompt: prompt.systemPrompt,
              ...(prompt.version ? { version: prompt.version } : {}),
            })),
            { session }
          )

          agent.prompts = createdPrompts.map((prompt) => prompt._id)
        }

        await agent.save({ session, validateModifiedOnly: true })

        await session.commitTransaction()

        const populatedAgent = await Agent.findById(agent._id)

        return res.json(populatedAgent as AgentDocument)
      } catch (error) {
        await session.abortTransaction()
        next(error)
        return undefined
      } finally {
        await session.endSession()
      }
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

      const agent = await Agent.findById(parsedParams.data.id)

      if (!agent) {
        return res.sendStatus(404)
      }

      await Prompt.create({
        agent: agent._id,
        systemPrompt: parsedBody.data.systemPrompt,
        ...(parsedBody.data.version ? { version: parsedBody.data.version } : {}),
      })

      const updatedAgent = await Agent.findById(agent._id)

      return res.status(201).json(updatedAgent as AgentDocument)
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

      const agent = await Agent.findById(parsedParams.data.id)

      if (!agent) {
        return res.sendStatus(404)
      }

      await Prompt.deleteMany({ agent: agent._id })
      await Agent.findByIdAndDelete(agent._id)

      return res.sendStatus(204)
    } catch (error) {
      next(error)
      return undefined
    }
  }
)

export { agentsRouter }
export default agentsRouter
