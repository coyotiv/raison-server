/* eslint-disable no-console */
import mongoose from 'mongoose'
import type {
  ChangeStream,
  ChangeStreamDocument,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
  Document as MongoDocument,
} from 'mongodb'
import type { Types } from 'mongoose'
import type { Server as SocketIOServer, Socket } from 'socket.io'

import Agent from '@/domains/agents/models/agent'
import Prompt from '@/domains/prompts/models/prompt'
import { findAgentById } from '@/domains/agents/service'
import registerAgentSocketHandlers from '@/domains/agents/socket-handlers'
import registerPromptSocketHandlers from '@/domains/prompts/socket-handlers'
import type { AgentChangedEvent, AgentDeletedEvent, AgentPayload } from '@/types'

type GenericChangeStream = ChangeStream<MongoDocument>

let agentChangeStream: GenericChangeStream | null = null
let promptChangeStream: GenericChangeStream | null = null

function isUpdateChange(doc: ChangeStreamDocument<MongoDocument>): doc is ChangeStreamUpdateDocument<MongoDocument> {
  return doc.operationType === 'update'
}

function isInsertChange(doc: ChangeStreamDocument<MongoDocument>): doc is ChangeStreamInsertDocument<MongoDocument> {
  return doc.operationType === 'insert' || doc.operationType === 'replace'
}

function hasDocumentKey(
  doc: ChangeStreamDocument<MongoDocument>
): doc is ChangeStreamDocument<MongoDocument> & { documentKey: MongoDocument } {
  return 'documentKey' in doc && Boolean(doc.documentKey)
}

const logPrefix = '[change-stream]'

async function fetchSerializedAgent(agentId: Types.ObjectId | string): Promise<AgentPayload | null> {
  try {
    const agent = await findAgentById(agentId.toString())
    if (!agent) {
      return null
    }
    return agent
  } catch (error) {
    console.error(`${logPrefix} Error fetching agent:`, error)
    return null
  }
}

function emitAgentChangedEvent(io: SocketIOServer, agent: AgentPayload, clusterTime: Date): void {
  const payload: AgentChangedEvent = {
    type: 'agent.changed',
    at: clusterTime.toISOString(),
    agent,
  }
  io.emit('agent.changed', payload)
  console.log(`${logPrefix} Emitted agent.changed for agent: ${agent._id}`)
}

function emitAgentDeletedEvent(io: SocketIOServer, agentId: string, clusterTime: Date): void {
  const payload: AgentDeletedEvent = {
    type: 'agent.deleted',
    at: clusterTime.toISOString(),
    agentId,
  }
  io.emit('agent.deleted', payload)
  console.log(`${logPrefix} Emitted agent.deleted for agent: ${agentId}`)
}

function startAgentChangeStream(io: SocketIOServer): GenericChangeStream {
  if (agentChangeStream) {
    return agentChangeStream
  }

  agentChangeStream = Agent.watch([], { fullDocument: 'updateLookup' })

  agentChangeStream.on('change', async (change: ChangeStreamDocument<MongoDocument>) => {
    console.log(`${logPrefix} Agent change detected:`, change.operationType)

    // Handle delete operations
    if (change.operationType === 'delete') {
      if (hasDocumentKey(change) && '_id' in change.documentKey) {
        const deletedId = change.documentKey._id.toString()
        const clusterTime = change.clusterTime ? new Date(change.clusterTime.getHighBits() * 1000) : new Date()
        emitAgentDeletedEvent(io, deletedId, clusterTime)
      }
      return
    }

    let payload: AgentPayload | null = null

    if (isInsertChange(change) && change.documentKey && '_id' in change.documentKey) {
      const insertedId = change.documentKey._id as Types.ObjectId | string
      payload = await fetchSerializedAgent(insertedId)
    }

    if (!payload && isUpdateChange(change) && change.documentKey && '_id' in change.documentKey) {
      const updatedId = change.documentKey._id as Types.ObjectId | string
      const deletedAt =
        (change.updateDescription?.updatedFields?.deletedAt as Date | undefined) ??
        (change.fullDocument && 'deletedAt' in change.fullDocument
          ? (change.fullDocument as { deletedAt?: Date | null }).deletedAt ?? undefined
          : undefined)

      const clusterTime = change.clusterTime ? new Date(change.clusterTime.getHighBits() * 1000) : new Date()

      if (deletedAt) {
        emitAgentDeletedEvent(io, updatedId.toString(), clusterTime)
        return
      }

      payload = await fetchSerializedAgent(updatedId)

      if (!payload) {
        console.warn(`${logPrefix} No agent payload available for update ${updatedId}`)
        return
      }

      emitAgentChangedEvent(io, payload, clusterTime)
      return
    }

    if (payload) {
      const clusterTime = change.clusterTime ? new Date(change.clusterTime.getHighBits() * 1000) : new Date()
      emitAgentChangedEvent(io, payload, clusterTime)
    } else {
      console.warn(`${logPrefix} No fullDocument available for ${change.operationType}`)
    }
  })

  agentChangeStream.on('error', (error: unknown) => {
    console.error(`${logPrefix} Agent change stream error:`, error)

    if (agentChangeStream) {
      agentChangeStream.close().catch(() => {})
      agentChangeStream = null
    }

    initializeAgentChangeStream(io)
  })

  console.log(`${logPrefix} Agent change stream initialized`)

  return agentChangeStream
}

function startPromptChangeStream(io: SocketIOServer): GenericChangeStream {
  if (promptChangeStream) {
    return promptChangeStream
  }

  promptChangeStream = Prompt.watch([], { fullDocument: 'updateLookup' })

  promptChangeStream.on('change', async (change: ChangeStreamDocument<MongoDocument>) => {
    console.log(`${logPrefix} Prompt change detected:`, change.operationType)

    const agentId =
      (isInsertChange(change) && change.fullDocument && 'agent' in change.fullDocument
        ? (change.fullDocument.agent as Types.ObjectId | string)
        : null) ??
      (hasDocumentKey(change) ? (change.documentKey._id as Types.ObjectId | string | undefined) : undefined)

    if (!agentId) {
      console.log(`${logPrefix} No agent ID found for prompt change`)
      return
    }

    const serializedAgent = await fetchSerializedAgent(agentId)

    if (!serializedAgent) {
      console.log(`${logPrefix} Agent not found for prompt change:`, agentId)
      return
    }

    // Use MongoDB's clusterTime for accurate timestamp
    const clusterTime = change.clusterTime ? new Date(change.clusterTime.getHighBits() * 1000) : new Date()
    emitAgentChangedEvent(io, serializedAgent, clusterTime)
  })

  promptChangeStream.on('error', (error: unknown) => {
    console.error(`${logPrefix} Prompt change stream error:`, error)

    if (promptChangeStream) {
      promptChangeStream.close().catch(() => {})
      promptChangeStream = null
    }

    initializePromptChangeStream(io)
  })

  console.log(`${logPrefix} Prompt change stream initialized`)

  return promptChangeStream
}

export function initializeAgentChangeStream(io: SocketIOServer): GenericChangeStream | null {
  if (agentChangeStream) {
    return agentChangeStream
  }

  if (mongoose.connection.readyState === 1) {
    return startAgentChangeStream(io)
  }

  mongoose.connection.once('open', () => {
    startAgentChangeStream(io)
  })

  return agentChangeStream
}

export function initializePromptChangeStream(io: SocketIOServer): GenericChangeStream | null {
  if (promptChangeStream) {
    return promptChangeStream
  }

  if (mongoose.connection.readyState === 1) {
    return startPromptChangeStream(io)
  }

  mongoose.connection.once('open', () => {
    startPromptChangeStream(io)
  })

  return promptChangeStream
}

export function initializeChangeStreams(io: SocketIOServer): void {
  initializeAgentChangeStream(io)
  initializePromptChangeStream(io)
}

export async function handleSocketConnection(socket: Socket): Promise<void> {
  console.log(`[socket.io] Client connected: ${socket.id}`)

  try {
    registerAgentSocketHandlers(socket)
    registerPromptSocketHandlers(socket)
  } catch (error) {
    console.error(`[socket.io] Error registering socket handlers for client ${socket.id}:`, error)
  }
}
