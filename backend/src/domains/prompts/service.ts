import type { FilterQuery } from 'mongoose'

import { Agent, type IAgent } from '@/domains/agents/models/agent'
import { normalizeTags } from '@/lib/tags'

import Prompt, { type IPrompt } from './models/prompt'
import type { PromptCreateInput, PromptUpdateInput } from './validators'

const ACTIVE_PROMPT_FILTER = { deletedAt: null }

export async function listPrompts(agentId?: string): Promise<IPrompt[]> {
  const filter: FilterQuery<IPrompt> = { ...ACTIVE_PROMPT_FILTER }
  if (agentId) {
    filter.agent = agentId
  }

  const prompts = await Prompt.find(filter).sort({ createdAt: -1 }).lean()

  return prompts
}

export async function findPromptById(id: string): Promise<IPrompt | null> {
  const prompt = await Prompt.findOne({ _id: id, ...ACTIVE_PROMPT_FILTER }).lean()

  return prompt
}

export type CreatePromptResult = { status: 'AGENT_NOT_FOUND' } | { status: 'SUCCESS'; agent: IAgent; prompt: IPrompt }

export async function createPrompt(data: PromptCreateInput): Promise<CreatePromptResult> {
  const agent = await Agent.findOne({ _id: data.agentId, deletedAt: null })

  if (!agent) {
    return { status: 'AGENT_NOT_FOUND' }
  }

  const createdPrompt = await Prompt.create({
    agent: agent._id,
    systemPrompt: data.systemPrompt,
    tags: normalizeTags(data.tags),
  })

  return { status: 'SUCCESS', agent, prompt: createdPrompt }
}

export type UpdatePromptResult =
  | { status: 'PROMPT_NOT_FOUND' }
  | { status: 'SUCCESS'; agent: IAgent | null; prompt: IPrompt }

export async function updatePrompt(id: string, data: PromptUpdateInput): Promise<UpdatePromptResult> {
  const updateData: Record<string, unknown> = {}

  if (data.systemPrompt !== undefined) {
    updateData.systemPrompt = data.systemPrompt
  }

  if (data.tags !== undefined) {
    updateData.tags = normalizeTags(data.tags)
  }

  const prompt = await Prompt.findOneAndUpdate({ _id: id, ...ACTIVE_PROMPT_FILTER }, updateData, {
    new: true,
    runValidators: true,
  })

  if (!prompt) {
    return { status: 'PROMPT_NOT_FOUND' }
  }

  const updatedAgent = await Agent.findById(prompt.agent)
  return { status: 'SUCCESS', agent: updatedAgent, prompt: prompt }
}

export type DeletePromptResult = { status: 'PROMPT_NOT_FOUND' } | { status: 'SUCCESS'; agent: IAgent | null }

export async function deletePrompt(id: string): Promise<DeletePromptResult> {
  const prompt = await Prompt.findOne({ _id: id, ...ACTIVE_PROMPT_FILTER })

  if (!prompt) {
    return { status: 'PROMPT_NOT_FOUND' }
  }

  const agentId = prompt.agent

  await Prompt.updateOne({ _id: prompt._id }, { $set: { deletedAt: new Date() } }).lean()

  const updatedAgent = await Agent.findById(agentId)
  return { status: 'SUCCESS', agent: updatedAgent as IAgent | null }
}
