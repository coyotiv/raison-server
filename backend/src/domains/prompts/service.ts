import Prompt from './model'
import Agent from '@/domains/agents/model'
import type { PromptDocument } from './model'
import type { AgentDocument } from '@/domains/agents/model'
import type { PromptCreateInput, PromptUpdateInput } from './validators'

export async function listPrompts(agentId?: string): Promise<PromptDocument[]> {
  const filter: Record<string, unknown> = {}

  if (agentId !== undefined) {
    filter.agent = agentId
  }

  const prompts = await Prompt.find(filter).sort({ createdAt: -1 })
  return prompts as PromptDocument[]
}

export async function findPromptById(id: string): Promise<PromptDocument | null> {
  const prompt = await Prompt.findById(id)
  return prompt as PromptDocument | null
}

export type CreatePromptResult =
  | { status: 'AGENT_NOT_FOUND' }
  | { status: 'SUCCESS'; agent: AgentDocument }

export async function createPrompt(data: PromptCreateInput): Promise<CreatePromptResult> {
  const agent = await Agent.findById(data.agentId)

  if (!agent) {
    return { status: 'AGENT_NOT_FOUND' }
  }

  await Prompt.create({
    agent: agent._id,
    systemPrompt: data.systemPrompt,
    ...(data.version ? { version: data.version } : {}),
  })

  const updatedAgent = await Agent.findById(agent._id)
  return { status: 'SUCCESS', agent: updatedAgent as AgentDocument }
}

export type UpdatePromptResult =
  | { status: 'PROMPT_NOT_FOUND' }
  | { status: 'SUCCESS'; agent: AgentDocument | null }

export async function updatePrompt(id: string, data: PromptUpdateInput): Promise<UpdatePromptResult> {
  const prompt = await Prompt.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })

  if (!prompt) {
    return { status: 'PROMPT_NOT_FOUND' }
  }

  const updatedAgent = await Agent.findById(prompt.agent)
  return { status: 'SUCCESS', agent: updatedAgent as AgentDocument | null }
}

export type DeletePromptResult =
  | { status: 'PROMPT_NOT_FOUND' }
  | { status: 'SUCCESS'; agent: AgentDocument | null }

export async function deletePrompt(id: string): Promise<DeletePromptResult> {
  const prompt = await Prompt.findById(id)

  if (!prompt) {
    return { status: 'PROMPT_NOT_FOUND' }
  }

  const agentId = prompt.agent

  await Prompt.findByIdAndDelete(prompt._id)

  const updatedAgent = await Agent.findById(agentId)
  return { status: 'SUCCESS', agent: updatedAgent as AgentDocument | null }
}
