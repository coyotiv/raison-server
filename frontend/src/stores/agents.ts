import { defineStore } from 'pinia'
import axios from 'axios'
import type { Socket } from 'socket.io-client'

function resolveApiUrl(path: string): string {
  // When running frontend dev server directly (not through Docker)
  if (import.meta.env.DEV && window.location.hostname === 'localhost' && window.location.port === '5173') {
    return `http://localhost:3000${path}`
  }
  // When running through Docker/Traefik - use api.localhost subdomain
  return `http://api.localhost${path}`
}

export type AgentPrompt = {
  _id: string
  agent: string
  systemPrompt: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type AgentDocument = {
  _id: string
  id: string
  name: string
  prompts?: AgentPrompt[]
  systemPrompt?: string | null
  createdAt: string
  updatedAt: string
}

export type AgentChangedEvent = {
  type: 'agent.changed'
  at: string
  agent: AgentDocument
}

export type AgentDeletedEvent = {
  type: 'agent.deleted'
  at: string
  agentId: string
}

export type AgentsInitialEvent = {
  type: 'agents.initial'
  at: string
  agents: AgentDocument[]
}

interface AgentsState {
  agents: AgentDocument[]
  loading: boolean
  error: string | null
  isSocketInitialized: boolean
}

export const useAgentsStore = defineStore('agents', {
  state: (): AgentsState => ({
    agents: [],
    loading: false,
    error: null,
    isSocketInitialized: false,
  }),
  getters: {
    agentMap(state) {
      return new Map(state.agents.map((agent) => [agent._id, agent]))
    },
  },
  actions: {
    async fetchAgents() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get<AgentDocument[]>(resolveApiUrl('/agents'), {
          withCredentials: true,
        })
        this.agents = response.data || []
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load agents'
      } finally {
        this.loading = false
      }
    },
    upsertAgent(agent: AgentDocument) {
      const index = this.agents.findIndex((item) => item._id === agent._id)
      if (index === -1) {
        this.agents.push(agent)
      } else {
        this.agents.splice(index, 1, agent)
      }
    },
    removeAgent(agentId: string) {
      const index = this.agents.findIndex((item) => item._id === agentId)
      if (index !== -1) {
        this.agents.splice(index, 1)
      }
    },
    async createAgent(payload: { name: string; prompts: { systemPrompt: string; tags: string[] }[] }) {
      this.error = null
      try {
        const response = await axios.post<AgentDocument>(
          resolveApiUrl('/agents'),
          payload,
          { withCredentials: true }
        )
        if (response.data) {
          this.upsertAgent(response.data)
        }
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create agent'
        throw err
      }
    },
    async updateAgent(agentId: string, payload: { name: string }) {
      this.error = null
      try {
        const response = await axios.put<AgentDocument>(
          resolveApiUrl(`/agents/${agentId}`),
          payload,
          { withCredentials: true }
        )
        if (response.data) {
          this.upsertAgent(response.data)
        }
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update agent'
        throw err
      }
    },
    async deleteAgent(agentId: string) {
      this.error = null
      try {
        await axios.delete(resolveApiUrl(`/agents/${agentId}`), { withCredentials: true })
        this.removeAgent(agentId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete agent'
        throw err
      }
    },
    async createPrompt(agentId: string, payload: { systemPrompt: string; tags: string[] }) {
      this.error = null
      try {
        const response = await axios.post<AgentDocument>(
          resolveApiUrl(`/agents/${agentId}/prompts`),
          payload,
          { withCredentials: true }
        )
        if (response.data) {
          this.upsertAgent(response.data)
        }
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create prompt'
        throw err
      }
    },
    async updatePrompt(promptId: string, payload: { systemPrompt?: string; tags?: string[] }) {
      this.error = null
      try {
        const response = await axios.put<AgentDocument>(
          resolveApiUrl(`/prompts/${promptId}`),
          payload,
          { withCredentials: true }
        )
        if (response.data) {
          this.upsertAgent(response.data)
        }
        return response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update prompt'
        throw err
      }
    },
    async deletePrompt(promptId: string) {
      this.error = null
      try {
        const response = await axios.delete<AgentDocument | void>(
          resolveApiUrl(`/prompts/${promptId}`),
          { withCredentials: true }
        )
        if (response.data) {
          this.upsertAgent(response.data)
        } else {
          // If no data returned, refetch to ensure consistency
          await this.fetchAgents()
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete prompt'
        throw err
      }
    },
    handleAgentChanged(event: AgentChangedEvent) {
      this.upsertAgent(event.agent)
    },
    handleAgentDeleted(event: AgentDeletedEvent) {
      this.removeAgent(event.agentId)
    },
    initializeSocketListeners(socket: Socket) {
      if (this.isSocketInitialized) {
        return
      }

      // Listen for individual agent changes
      socket.on('agent.changed', (payload: AgentChangedEvent) => {
        this.handleAgentChanged(payload)
      })

      // Listen for agent deletions
      socket.on('agent.deleted', (payload: AgentDeletedEvent) => {
        this.handleAgentDeleted(payload)
      })

      // Listen for initial bulk sync
      socket.on('agents.initial', (payload: AgentsInitialEvent) => {
        if (Array.isArray(payload.agents)) {
          this.agents = payload.agents
        }
      })

      this.isSocketInitialized = true
    },
  },
})
