import { validate } from 'echt'
import { Router } from 'express'

import {
  listPrompts,
  findPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  getPromptHistory,
  getPromptVersion,
  restorePromptVersion,
} from './service'
import {
  listPromptsRequest,
  getPromptRequest,
  createPromptRequest,
  updatePromptRequest,
  deletePromptRequest,
  getPromptHistoryRequest,
  getPromptVersionRequest,
  restorePromptVersionRequest,
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
  '/:id/history',
  validate(getPromptHistoryRequest).use(async (req, res, next) => {
    try {
      const result = await getPromptHistory(req.params.id)
      if (result.status === 'PROMPT_NOT_FOUND') {
        res.status(404).json({ message: 'Prompt not found' })
        return
      }
      res.json(result.revisions)
    } catch (error) {
      next(error)
    }
  })
)

promptsRouter.get(
  '/:id/versions/:version',
  validate(getPromptVersionRequest).use(async (req, res, next) => {
    try {
      const version = Number(req.params.version)
      const result = await getPromptVersion(req.params.id, version)

      if (result.status === 'PROMPT_NOT_FOUND') {
        res.status(404).json({ message: 'Prompt not found' })
        return
      }

      if (result.status === 'VERSION_NOT_FOUND') {
        res.status(404).json({ message: 'Version not found' })
        return
      }

      res.json(result.revision)
    } catch (error) {
      next(error)
    }
  })
)

promptsRouter.post(
  '/:id/restore/:version',
  validate(restorePromptVersionRequest).use(async (req, res, next) => {
    try {
      const version = Number(req.params.version)
      const result = await restorePromptVersion(req.params.id, version)

      if (result.status === 'NOT_FOUND') {
        res.status(404).json({ message: 'Prompt or version not found' })
        return
      }

      res.json(result.prompt)
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
