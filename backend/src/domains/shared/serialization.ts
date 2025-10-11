import type { AgentDocument } from '@/domains/agents/model'
import type { PromptDocument } from '@/domains/prompts/model'
import type { UserDocument } from '@/domains/users/model'
import type { AgentPayload, PromptPayload, UserPayload } from '@/types'

export function toAgentPayload(agent: AgentDocument): AgentPayload {
  const json = agent.toJSON() as AgentPayload
  json._id = agent._id.toString()
  return json
}

export function toPromptPayload(prompt: PromptDocument): PromptPayload {
  const json = prompt.toJSON() as PromptPayload
  json._id = prompt._id.toString()

  if (typeof json.agent === 'object' && json.agent !== null && '_id' in (json.agent as Record<string, unknown>)) {
    const agentObject = json.agent as { _id?: unknown }
    json.agent = typeof agentObject._id === 'string' ? agentObject._id : String(agentObject._id)
  } else {
    json.agent = prompt.agent.toString()
  }

  if (json.version === undefined && typeof prompt.version !== 'undefined' && prompt.version !== null) {
    json.version = String(prompt.version)
  }

  return json
}

export function toUserPayload(user: UserDocument): UserPayload {
  const json = user.toJSON() as UserPayload
  json._id = user._id.toString()
  return json
}