import { validate } from 'echt'
import { Router } from 'express'

import { listPrompts, findPromptById, createPrompt, updatePrompt, deletePrompt } from './service'
import {
  listPromptsRequest,
  getPromptRequest,
  createPromptRequest,
  updatePromptRequest,
  deletePromptRequest,
} from './validators'

const promptsRouter = Router()

promptsRouter.get(
  '/',
  validate(listPromptsRequest).use(async (req, res, next) => {
    try {
      const prompts = await listPrompts(req.query.agentId)

      res.json(prompts)
    } catch (error) {
      next(error)
    }
  })
)

promptsRouter.get(
  '/:id',
  validate(getPromptRequest).use(async (req, res, next) => {
    try {
      const prompt = await findPromptById(req.params.id)

      if (!prompt) {
        res.status(404).json({ message: 'Prompt not found' })
        return
      }

      res.json(prompt)
    } catch (error) {
      next(error)
    }
  })
)

promptsRouter.post(
  '/',
  validate(createPromptRequest).use(async (req, res, next) => {
    try {
      const result = await createPrompt(req.body)

      if (result.status === 'AGENT_NOT_FOUND') {
        res.status(404).json({ message: 'Agent not found' })
        return
      }

      res.status(201).json(result.prompt)
    } catch (error) {
      next(error)
    }
  })
)

promptsRouter.put(
  '/:id',
  validate(updatePromptRequest).use(async (req, res, next) => {
    try {
      const result = await updatePrompt(req.params.id, req.body)

      if (result.status === 'PROMPT_NOT_FOUND') {
        res.status(404).json({ message: 'Prompt not found' })
        return
      }

      res.json(result.prompt)
    } catch (error) {
      next(error)
    }
  })
)

promptsRouter.delete(
  '/:id',
  validate(deletePromptRequest).use(async (req, res, next) => {
    try {
      const result = await deletePrompt(req.params.id)

      if (result.status === 'PROMPT_NOT_FOUND') {
        res.status(404).json({ message: 'Prompt not found' })
        return
      }

      if (!result.agent) {
        res.sendStatus(204)
        return
      }

      res.status(204).json(null)
    } catch (error) {
      next(error)
    }
  })
)

export default promptsRouter
