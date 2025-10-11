import type { Socket } from 'socket.io'
import type { AgentsInitialEvent } from '@/types'
import {
  agentCreateSchema,
  agentUpdateSchema,
  agentIdParamSchema,
  agentListQuerySchema,
  agentPromptCreateSchema,
} from './validators'
import {
  listAgents,
  findAgentById,
  createAgent,
  updateAgent,
  appendAgentPrompt,
  deleteAgent,
} from './service'
import {
  respondWithError,
  respondWithSuccess,
  formatUnknownError,
} from '@/domains/shared/socket'
import { toAgentPayload } from '@/domains/shared/serialization'
import { formatZodError } from '@/lib/error-handler'

function registerAgentSocketHandlers(socket: Socket): void {
  async function emitInitialAgents(): Promise<void> {
    const agents = await listAgents()
    const payload: AgentsInitialEvent = {
      type: 'agents.initial',
      at: new Date().toISOString(),
      agents: agents.map(toAgentPayload),
    }

    socket.emit('agents.initial', payload)
  }

  emitInitialAgents().catch((error) => {
    const message = formatUnknownError(error, 'Failed to send initial agents')
    console.error(message)
  })

  socket.on('agents:list', async (payload, callback) => {
    try {
      const parsedQuery = agentListQuerySchema.safeParse(payload ?? {})
      if (!parsedQuery.success) {
        respondWithError(callback, formatZodError(parsedQuery.error))
        return
      }

      const agents = await listAgents(parsedQuery.data.version)
      respondWithSuccess(callback, agents.map(toAgentPayload))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to list agents'))
    }
  })

  socket.on('agents:get', async (payload, callback) => {
    try {
      const parsedParams = agentIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, formatZodError(parsedParams.error))
        return
      }

      const parsedQuery = agentListQuerySchema.safeParse(payload ? { version: payload.version } : {})
      if (!parsedQuery.success) {
        respondWithError(callback, formatZodError(parsedQuery.error))
        return
      }

      const agent = await findAgentById(parsedParams.data.id, parsedQuery.data.version)

      if (!agent) {
        respondWithError(callback, 'Agent not found')
        return
      }

      respondWithSuccess(callback, toAgentPayload(agent))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to fetch agent'))
    }
  })

  socket.on('agents:create', async (payload, callback) => {
    try {
      const parsedBody = agentCreateSchema.safeParse(payload)
      if (!parsedBody.success) {
        respondWithError(callback, formatZodError(parsedBody.error))
        return
      }

      const agent = await createAgent(parsedBody.data)
      respondWithSuccess(callback, toAgentPayload(agent))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to create agent'))
    }
  })

  socket.on('agents:update', async (payload, callback) => {
    try {
      const parsedParams = agentIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, formatZodError(parsedParams.error))
        return
      }

      const parsedBody = agentUpdateSchema.safeParse(payload?.data ?? payload?.body ?? {})
      if (!parsedBody.success) {
        respondWithError(callback, formatZodError(parsedBody.error))
        return
      }

      const agent = await updateAgent(parsedParams.data.id, parsedBody.data)

      if (!agent) {
        respondWithError(callback, 'Agent not found')
        return
      }

      respondWithSuccess(callback, toAgentPayload(agent))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to update agent'))
    }
  })

  socket.on('agents:addPrompt', async (payload, callback) => {
    try {
      const parsedParams = agentIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, formatZodError(parsedParams.error))
        return
      }

      const parsedBody = agentPromptCreateSchema.safeParse(payload?.prompt)
      if (!parsedBody.success) {
        respondWithError(callback, formatZodError(parsedBody.error))
        return
      }

      const agent = await appendAgentPrompt(parsedParams.data.id, parsedBody.data)

      if (!agent) {
        respondWithError(callback, 'Agent not found')
        return
      }

      respondWithSuccess(callback, toAgentPayload(agent))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to add agent prompt'))
    }
  })

  socket.on('agents:delete', async (payload, callback) => {
    try {
      const parsedParams = agentIdParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, formatZodError(parsedParams.error))
        return
      }

      const deleted = await deleteAgent(parsedParams.data.id)

      if (!deleted) {
        respondWithError(callback, 'Agent not found')
        return
      }

      respondWithSuccess(callback, true)
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to delete agent'))
    }
  })
}

export default registerAgentSocketHandlers