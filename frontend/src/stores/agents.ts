import { defineStore } from 'pinia'
import axios from 'axios'
import type { Socket } from 'socket.io-client'

type AgentPrompt = {
  _id?: string
  systemPrompt?: string
  version?: string
  [key: string]: unknown
}

type AgentDocument = {
  _id: string
  name: string
  prompts?: AgentPrompt[]
  [key: string]: unknown
}

type AgentsChangeEvent = {
  operationType: string
  documentKey?: { _id?: string }
  fullDocument?: AgentDocument | null
  updateDescription?: {
    updatedFields?: Record<string, unknown>
    removedFields?: string[]
  }
}

interface AgentsState {
  agents: AgentDocument[]
  loading: boolean
  error: string | null
  isSocketInitialized: boolean
}

function mergeAgentFields(target: AgentDocument, source: Partial<AgentDocument>) {
  Object.assign(target, source)
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
        const response = await axios.get<AgentDocument[]>('/api/agents')
        this.agents = response.data || []
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load agents'
      } finally {
        this.loading = false
      }
    },
    handleChangeEvent(event: AgentsChangeEvent) {
      const { operationType, documentKey, fullDocument } = event
      const id = documentKey?._id || fullDocument?._id

      if (!operationType || !id) {
        return
      }

      const existingIndex = this.agents.findIndex((agent) => agent._id === id)

      if (operationType === 'delete') {
        if (existingIndex !== -1) {
          this.agents.splice(existingIndex, 1)
        }
        return
      }

      if (operationType === 'insert' || operationType === 'replace') {
        if (!fullDocument) return
        const document = fullDocument as AgentDocument
        if (existingIndex === -1) {
          this.agents.push(document)
        } else {
          this.agents.splice(existingIndex, 1, document)
        }
        return
      }

      if (operationType === 'update') {
        if (!fullDocument) {
          // fallback: merge updatedFields with existing
          if (existingIndex !== -1 && event.updateDescription?.updatedFields) {
            const agent = this.agents[existingIndex]
            if (!agent) {
              return
            }
            mergeAgentFields(agent, event.updateDescription.updatedFields as Partial<AgentDocument>)
          }
          return
        }

        const document = fullDocument as AgentDocument
        if (existingIndex === -1) {
          this.agents.push(document)
        } else {
          this.agents.splice(existingIndex, 1, document)
        }
      }
    },
    initializeSocketListeners(socket: Socket) {
      if (this.isSocketInitialized) {
        return
      }

      socket.on('agents', (payload: AgentsChangeEvent) => {
        this.handleChangeEvent(payload)
      })

      this.isSocketInitialized = true
    },
  },
})
