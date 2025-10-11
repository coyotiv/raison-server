/* eslint-disable no-console */
import mongoose from 'mongoose'
import type {
  ChangeStream,
  ChangeStreamDocument,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
  Document as MongoDocument,
} from 'mongodb'
import type { Server as SocketIOServer, Socket } from 'socket.io'
import type { Types } from 'mongoose'
import Agent, { AgentDocument } from './domains/agents/model'
import Prompt from './domains/prompts/model'
import type { AgentsChangeEvent, AgentsInitialEvent, AgentPayload } from './types'

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

function serializeAgentDocument(agent: AgentDocument | null): AgentPayload | null {
  if (!agent) {
    return null
  }

  const json = agent.toJSON() as AgentPayload
  json._id = agent._id.toString()
  return json
}

async function fetchSerializedAgent(agentId: Types.ObjectId | string): Promise<AgentPayload | null> {
  try {
    const agent = await Agent.findById(agentId)
    return serializeAgentDocument(agent)
  } catch (error) {
    console.error(`${logPrefix} Error fetching agent:`, error)
    return null
  }
}

function emitAgentEvent(io: SocketIOServer, payload: AgentsChangeEvent): void {
  io.emit('agents', payload)
}

function startAgentChangeStream(io: SocketIOServer): GenericChangeStream {
  if (agentChangeStream) {
    return agentChangeStream
  }

  agentChangeStream = Agent.watch([], { fullDocument: 'updateLookup' })

  agentChangeStream.on('change', async (change: ChangeStreamDocument<MongoDocument>) => {
    console.log(`${logPrefix} Agent change detected:`, change.operationType)

    let fullDocument: AgentPayload | null = null

    if (isInsertChange(change) && change.fullDocument) {
      fullDocument = serializeAgentDocument(Agent.hydrate(change.fullDocument as MongoDocument))
    }

    if (isUpdateChange(change) && change.documentKey && '_id' in change.documentKey) {
      const updatedId = change.documentKey._id as Types.ObjectId | string
      fullDocument = await fetchSerializedAgent(updatedId)
    }

    const documentKey = hasDocumentKey(change) ? change.documentKey : undefined
    const updateDescription = isUpdateChange(change) ? change.updateDescription : undefined

    emitAgentEvent(io, {
      operationType: change.operationType,
      documentKey,
      fullDocument,
      updateDescription,
    })
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
        : null) ?? (hasDocumentKey(change) ? (change.documentKey._id as Types.ObjectId | string | undefined) : undefined)

    if (!agentId) {
      console.log(`${logPrefix} No agent ID found for prompt change`)
      return
    }

    const serializedAgent = await fetchSerializedAgent(agentId)

    if (!serializedAgent) {
      console.log(`${logPrefix} Agent not found for prompt change:`, agentId)
      return
    }

    emitAgentEvent(io, {
      operationType: 'update',
      documentKey: { _id: agentId },
      fullDocument: serializedAgent,
      updateDescription: {
        updatedFields: { prompts: serializedAgent.prompts, systemPrompt: serializedAgent.systemPrompt },
      },
    })

    console.log(`${logPrefix} Emitted agent update for prompt change: ${agentId}`)
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
    const agents = await Agent.find()
    const agentObjects: AgentPayload[] = agents.map((agent) => agent.toJSON() as AgentPayload)

    const payload: AgentsInitialEvent = {
      type: 'agents.initial',
      at: new Date().toISOString(),
      agents: agentObjects,
    }

    socket.emit('agents.initial', payload)

    console.log(`[socket.io] Sent ${agents.length} agents to client ${socket.id}`)
  } catch (error) {
    console.error(`[socket.io] Error sending initial agents to client ${socket.id}:`, error)
  }
}