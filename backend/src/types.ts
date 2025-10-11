export type AgentPayload = {
  _id: string
  name: string
  prompts?: unknown
  systemPrompt?: unknown
  [key: string]: unknown
}

export type AgentChangedEvent = {
  type: 'agent.changed'
  at: string
  agent: AgentPayload
}

export type AgentDeletedEvent = {
  type: 'agent.deleted'
  at: string
  agentId: string
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
