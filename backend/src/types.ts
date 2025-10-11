import type { Document as MongoDocument } from 'mongodb'

export type AgentPayload = {
  _id: string
  name: string
  prompts?: unknown
  systemPrompt?: unknown
  [key: string]: unknown
}

export type AgentsChangeEvent = {
  operationType: string
  documentKey?: MongoDocument
  fullDocument?: AgentPayload | null
  updateDescription?: MongoDocument
}

export type AgentsInitialEvent = {
  type: 'agents.initial'
  at: string
  agents: AgentPayload[]
}

export type SocketAuth = {
  apiKey?: string
}

export type SeedPrompt = {
  systemPrompt: string
  version?: string | number
}

export type SeedAgent = {
  name: string
  prompts?: SeedPrompt[]
}

export type SeedFile = {
  agents: SeedAgent[]
}
