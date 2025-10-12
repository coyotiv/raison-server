import mongoose, { type ClientSession } from 'mongoose'

import Prompt from '@/domains/prompts/model'
import { DEFAULT_PROMPT_TAG, normalizeTags } from '@/lib/tags'
import Agent, { type PopulatedAgent } from './model'
import type {
  AgentCreateInput,
  AgentUpdateInput,
  AgentPromptCreateInput,
} from './validators'

function buildPromptPopulate(tag?: string) {
  return {
    path: 'prompts',
    match: { tags: tag ?? DEFAULT_PROMPT_TAG },
  }
}

async function runWithSession<T>(operation: (session: ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const result = await operation(session)
    await session.commitTransaction()
    return result
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}

export async function listAgents(tag?: string) {
  const agents = await Agent.find({}, null, { autopopulate: false }).populate(buildPromptPopulate(tag)).lean() as PopulatedAgent[]

  return agents
}

export async function findAgentById(id: string, tag?: string) {
  const agent = await Agent.findById(id, null, { autopopulate: false }).populate(buildPromptPopulate(tag)).lean()

  return agent as PopulatedAgent | null
}

export async function createAgent(data: AgentCreateInput) {
  const agentId = await runWithSession(async session => {
    const [agent] = await Agent.create([{ name: data.name }], { session })

    const promptsToCreate = data.prompts.map((prompt: AgentPromptCreateInput) => ({
      agent: agent._id,
      systemPrompt: prompt.systemPrompt,
      tags: normalizeTags(prompt.tags),
    }))

    const createdPrompts = await Prompt.create(promptsToCreate, { session })
    agent.prompts = createdPrompts.map(prompt => prompt._id)

    await agent.save({ session })

    return agent._id
  })

  const populatedAgent = await findAgentById(agentId.toString())
  return populatedAgent as PopulatedAgent
}

export async function updateAgent(id: string, data: AgentUpdateInput) {
  const agentId = await runWithSession(async session => {
    const agent = await Agent.findById(id).session(session)

    if (!agent) {
      return null
    }

    agent.name = data.name

    if (data.prompts) {
      await Prompt.deleteMany({ agent: agent._id }).session(session)

      const createdPrompts = await Prompt.create(
        data.prompts.map(prompt => ({
          agent: agent._id,
          systemPrompt: prompt.systemPrompt,
          tags: normalizeTags(prompt.tags),
        })),
        { session }
      )

      agent.prompts = createdPrompts.map(prompt => prompt._id)
    }

    await agent.save({ session, validateModifiedOnly: true })

    return agent._id
  })

  if (!agentId) {
    return null
  }

  const populatedAgent = await findAgentById(agentId.toString())
  return populatedAgent as PopulatedAgent | null
}

export async function appendAgentPrompt(id: string, data: AgentPromptCreateInput) {
  const agent = await Agent.findById(id).lean()

  if (!agent) {
    return null
  }

  const createdPrompt = await Prompt.create({
    agent: agent._id,
    systemPrompt: data.systemPrompt,
    tags: normalizeTags(data.tags),
  })

  const updatedAgent = await Agent.findByIdAndUpdate(agent._id.toString(), { $push: { prompts: createdPrompt._id } }, { new: true, lean: true }).populate('prompts')
  return updatedAgent as PopulatedAgent | null
}

export async function deleteAgent(id: string): Promise<boolean> {
  const agent = await Agent.findById(id).lean()

  if (!agent) {
    return false
  }

  await Prompt.deleteMany({ agent: agent._id }).lean()
  await Agent.findByIdAndDelete(agent._id).lean()

  return true
}
