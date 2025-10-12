import type { Socket } from 'socket.io'

import { formatZodError } from '@/lib/error-handler'

import { agentNameParamSchema, agentTagsQuerySchema } from './validators'
import { listAgents, findAgentByName, toAgentPayload } from './service'
import { respondWithError, respondWithSuccess, formatUnknownError } from '../shared/socket'

function registerAgentSocketHandlers(socket: Socket): void {
  socket.on('agents:list', async (payload, callback) => {
    try {
      const parsedQuery = agentTagsQuerySchema.safeParse(payload ?? {})
      if (!parsedQuery.success) {
        respondWithError(callback, formatZodError(parsedQuery.error))
        return
      }

      const agents = await listAgents(parsedQuery.data.tag)
      respondWithSuccess(callback, agents.map(toAgentPayload))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to list agents'))
    }
  })

  socket.on('agents:getByName', async (payload, callback) => {
    try {
      const parsedParams = agentNameParamSchema.safeParse(payload ?? {})
      if (!parsedParams.success) {
        respondWithError(callback, formatZodError(parsedParams.error))
        return
      }

      const agent = await findAgentByName(parsedParams.data.name)

      if (!agent) {
        respondWithError(callback, `Agent with name "${parsedParams.data.name}" not found`)
        return
      }

      respondWithSuccess(callback, toAgentPayload(agent))
    } catch (error) {
      respondWithError(callback, formatUnknownError(error, 'Failed to fetch agent by name'))
    }
  })
}

export default registerAgentSocketHandlers
