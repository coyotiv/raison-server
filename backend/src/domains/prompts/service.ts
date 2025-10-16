import Agent, { type AgentDocument } from '@/domains/agents/model'

import Prompt, {
  PromptRevision,
  type PromptDocument,
  type PromptRevisionDocument,
  softDeletePromptById,
} from './model'
import type { PromptCreateInput, PromptUpdateInput } from './validators'
import { normalizeTags } from '@/lib/tags'

const ACTIVE_PROMPT_FILTER = { deletedAt: null }

function buildPromptFilter(agentId?: string) {
  const filter: Record<string, unknown> = { ...ACTIVE_PROMPT_FILTER }

  if (agentId !== undefined) {
    filter.agent = agentId
  }

  return filter
}

export async function listPrompts(agentId?: string): Promise<PromptDocument[]> {
  const prompts = await Prompt.find(buildPromptFilter(agentId)).sort({ createdAt: -1 }).lean()
  return prompts as PromptDocument[]
}

export async function findPromptById(id: string): Promise<PromptDocument | null> {
  const prompt = await Prompt.findOne({ _id: id, ...ACTIVE_PROMPT_FILTER }).lean()
  return prompt as PromptDocument | null
}

async function findActivePrompt(promptId: string): Promise<PromptDocument | null> {
  const prompt = await Prompt.findOne({ _id: promptId, ...ACTIVE_PROMPT_FILTER }).lean()
  return prompt as PromptDocument | null
}

export type GetPromptHistoryResult =
  | { status: 'PROMPT_NOT_FOUND' }
  | { status: 'SUCCESS'; revisions: PromptRevisionDocument[] }

export async function getPromptHistory(promptId: string): Promise<GetPromptHistoryResult> {
  const prompt = await findActivePrompt(promptId)
  if (!prompt) {
    return { status: 'PROMPT_NOT_FOUND' }
  }
  const revisions = await PromptRevision.find({ promptId }).sort({ version: -1 }).lean()
  return { status: 'SUCCESS', revisions: revisions as PromptRevisionDocument[] }
}

export type GetPromptVersionResult =
  | { status: 'PROMPT_NOT_FOUND' }
  | { status: 'VERSION_NOT_FOUND' }
  | { status: 'SUCCESS'; revision: PromptRevisionDocument }

export async function getPromptVersion(
  promptId: string,
  version: number
): Promise<GetPromptVersionResult> {
  const prompt = await findActivePrompt(promptId)
  if (!prompt) {
    return { status: 'PROMPT_NOT_FOUND' }
  }
  const revision = await PromptRevision.findOne({ promptId, version }).lean()
  if (!revision) {
    return { status: 'VERSION_NOT_FOUND' }
  }
  return { status: 'SUCCESS', revision: revision as PromptRevisionDocument }
}

export async function restorePromptVersion(
  promptId: string,
  version: number
): Promise<{ status: 'NOT_FOUND' } | { status: 'SUCCESS'; prompt: PromptDocument }> {
  const prompt = await Prompt.findOne({ _id: promptId, ...ACTIVE_PROMPT_FILTER })
  if (!prompt) {
    return { status: 'NOT_FOUND' }
  }

  const revision = await PromptRevision.findOne({ promptId, version })

  if (!revision) {
    return { status: 'NOT_FOUND' }
  }

  const updatedPrompt = await Prompt.findOneAndUpdate(
    { _id: promptId, ...ACTIVE_PROMPT_FILTER },
    {
      $set: {
        systemPrompt: revision.systemPrompt,
        tags: revision.tags,
      },
    },
    { new: true, runValidators: true }
  )

  if (!updatedPrompt) {
    return { status: 'NOT_FOUND' }
  }

  return { status: 'SUCCESS', prompt: updatedPrompt as PromptDocument }
}

export type CreatePromptResult =
  | { status: 'AGENT_NOT_FOUND' }
  | { status: 'SUCCESS'; agent: AgentDocument; prompt: PromptDocument }

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
  const updatedAgent = await Agent.findById(agent._id)

  return { status: 'SUCCESS', agent: updatedAgent as AgentDocument, prompt: createdPrompt as PromptDocument }
}

export type UpdatePromptResult =
  | { status: 'PROMPT_NOT_FOUND' }
  | { status: 'SUCCESS'; agent: AgentDocument | null; prompt: PromptDocument }

export async function updatePrompt(id: string, data: PromptUpdateInput): Promise<UpdatePromptResult> {
  const updateFields: Record<string, unknown> = {}

  if (data.systemPrompt !== undefined) {
    updateFields.systemPrompt = data.systemPrompt
  }

  if (data.tags !== undefined) {
    updateFields.tags = normalizeTags(data.tags)
  }

  const prompt = await Prompt.findOneAndUpdate(
    { _id: id, ...ACTIVE_PROMPT_FILTER },
    { $set: updateFields },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!prompt) {
    return { status: 'PROMPT_NOT_FOUND' }
  }

  const updatedAgent = await Agent.findById(prompt.agent)
  return { status: 'SUCCESS', agent: updatedAgent, prompt: prompt }
}

export type DeletePromptResult = { status: 'PROMPT_NOT_FOUND' } | { status: 'SUCCESS'; agent: AgentDocument | null }

export async function deletePrompt(id: string): Promise<DeletePromptResult> {
  const updatedPrompt = await softDeletePromptById(id)

  if (!updatedPrompt) {
    return { status: 'PROMPT_NOT_FOUND' }
  }

  const updatedAgent = await Agent.findById(updatedPrompt.agent)
  return { status: 'SUCCESS', agent: updatedAgent as AgentDocument | null }
}
