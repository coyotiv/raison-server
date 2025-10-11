import type { Socket } from 'socket.io'
import {
  promptListQuerySchema,
  promptCreateSchema,
  promptUpdateSchema,
  promptIdParamSchema,
} from './validators.js'
import {
  listPrompts,
  findPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from './service.js'
import { respondWithError, respondWithSuccess, formatUnknownError } from '../shared/socket.js'
import { toAgentPayload, toPromptPayload } from '../shared/serialization.js'
import type { PromptsInitialEvent } from '../../types.js'

function registerPromptSocketHandlers(socket: Socket): void {
  async function emitInitialPrompts(): Promise<void> {
    const prompts = await listPrompts()
    const payload: PromptsInitialEvent = {
      type: 'prompts.initial',
      at: new Date().toISOString(),
      prompts: prompts.map(toPromptPayload),
    }

    socket.emit('prompts.initial', payload)
  }

  emitInitialPrompts().catch((error) => {
    const message = formatUnknownError(error, 'Failed to send initial prompts')
    console.error(message)
  })

  socket.on('prompts:list', async (payload, callback) => {
    try {
      const parsedQuery = promptListQuerySchema.safeParse(payload ?? {})
      if (!parsedQuery.success) {
        respondWithError(callback, parsedQuery.error.flatten().formErrors.join(', '))
        return
      }

      const prompts = await listPrompts(parsedQuery.data.agentId)
      respondWithSuccess(callback, prompts.map(toPromptPayload))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to list prompts'))
    }
  })

  socket.on('prompts:get', async (payload, callback) => {
    try {
      const parsedParams = promptIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, parsedParams.error.flatten().formErrors.join(', '))
        return
      }

      const prompt = await findPromptById(parsedParams.data.id)

      if (!prompt) {
        respondWithError(callback, 'Prompt not found')
        return
      }

      respondWithSuccess(callback, toPromptPayload(prompt))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to fetch prompt'))
    }
  })

  socket.on('prompts:create', async (payload, callback) => {
    try {
      const parsedBody = promptCreateSchema.safeParse(payload)
      if (!parsedBody.success) {
        respondWithError(callback, parsedBody.error.flatten().formErrors.join(', '))
        return
      }

      const result = await createPrompt(parsedBody.data)

      if (result.status === 'AGENT_NOT_FOUND') {
        respondWithError(callback, 'Agent not found')
        return
      }

      respondWithSuccess(callback, toAgentPayload(result.agent))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to create prompt'))
    }
  })

  socket.on('prompts:update', async (payload, callback) => {
    try {
      const parsedParams = promptIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, parsedParams.error.flatten().formErrors.join(', '))
        return
      }

      const parsedBody = promptUpdateSchema.safeParse(payload?.data ?? payload?.body ?? {})
      if (!parsedBody.success) {
        respondWithError(callback, parsedBody.error.flatten().formErrors.join(', '))
        return
      }

      const result = await updatePrompt(parsedParams.data.id, parsedBody.data)

      if (result.status === 'PROMPT_NOT_FOUND') {
        respondWithError(callback, 'Prompt not found')
        return
      }

      respondWithSuccess(callback, result.agent ? toAgentPayload(result.agent) : null)
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to update prompt'))
    }
  })

  socket.on('prompts:delete', async (payload, callback) => {
    try {
      const parsedParams = promptIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, parsedParams.error.flatten().formErrors.join(', '))
        return
      }

      const result = await deletePrompt(parsedParams.data.id)

      if (result.status === 'PROMPT_NOT_FOUND') {
        respondWithError(callback, 'Prompt not found')
        return
      }

      respondWithSuccess(callback, result.agent ? toAgentPayload(result.agent) : null)
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to delete prompt'))
    }
  })
}

export default registerPromptSocketHandlers