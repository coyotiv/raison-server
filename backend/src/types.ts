import type { Types } from 'mongoose'

import type { Prompt } from './domains/prompts/model'

type ID = Types.ObjectId | string

export type AgentPayload = {
  _id: ID
  name: string
  prompts?: Prompt[]
  systemPrompt?: Prompt
}

export type AgentChangedEvent = {
  type: 'agent.changed'
  at: string
  agent: AgentPayload
}

export type AgentDeletedEvent = {
  type: 'agent.deleted'
  at: string
  agentId: ID
}

export type AgentsInitialEvent = {
  type: 'agents.initial'
  at: string
  agents: AgentPayload[]
}

export type PromptPayload = {
  _id: ID
  agent: ID
  systemPrompt: string
  tags: string[]
}

export type PromptsInitialEvent = {
  type: 'prompts.initial'
  at: string
  prompts: PromptPayload[]
}

export type UserPayload = {
  _id: ID
  name: string
}

export type UsersInitialEvent = {
  type: 'users.initial'
  at: string
  users: UserPayload[]
}

export type SocketAuth = {
  apiKey?: string
}

export type SeedPrompt = {
  systemPrompt: string
  tags?: string[]
}

export type SeedAgent = {
  name: string
  prompts?: SeedPrompt[]
}

export type SeedFile = {
  agents: SeedAgent[]
}

export type ErrorResponse = { message: string }
