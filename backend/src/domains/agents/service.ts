import Prompt from '@/domains/prompts/models/prompt'
import { DEFAULT_PROMPT_TAG, normalizeTags } from '@/lib/tags'
import { type IAgentWithSystemPrompt, Agent, type IAgent } from './models/agent'
import type { AgentCreateInput, AgentUpdateInput, AgentPromptCreateInput } from './validators'
import { runWithSession } from '@/lib/database-connection'

export async function listAgents(tag?: string): Promise<IAgentWithSystemPrompt[]> {
  const agents = await Agent.aggregate([
    { $match: { deletedAt: null } },
    {
      $lookup: {
        from: 'prompts',
        localField: '_id',
        foreignField: 'agent',
        as: 'prompts',
        pipeline: [
          { $match: { deletedAt: null, tags: tag ?? DEFAULT_PROMPT_TAG } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
      },
    },
    {
      $addFields: {
        systemPrompt: { $arrayElemAt: ['$prompts.systemPrompt', 0] },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        systemPrompt: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    }
  ])

  return agents
}

async function getSystemPrompt(agentId: IAgent['_id'], tag?: string): Promise<string | null> {
  const prompt = await Prompt.findOne({ agent: agentId, deletedAt: null, tags: tag ?? DEFAULT_PROMPT_TAG }).sort({ createdAt: -1 }).lean()
  return prompt?.systemPrompt ?? null
}

export async function findAgentById(id: string, tag?: string): Promise<IAgentWithSystemPrompt | null> {
  const agent = await Agent.findOne({ _id: id, deletedAt: null }).lean()

  if (!agent) {
    return null
  }

  const systemPrompt = await getSystemPrompt(agent._id, tag)

  return {
    ...agent,
    systemPrompt,
  }
}

export async function findAgentByName(name: string, tag?: string) {
  const agent = await Agent.findOne({ name, deletedAt: null }).lean()

  if (!agent) {
    return null
  }

  const systemPrompt = await getSystemPrompt(agent._id, tag)

  return {
    ...agent,
    systemPrompt,
  }
}

export async function createAgent(data: AgentCreateInput): Promise<IAgentWithSystemPrompt> {
  const { agent, prompt } = await runWithSession(async session => {
    const [agent] = await Agent.create([{ name: data.name }], { session })

    const [prompt] = await Prompt.create(
      [
        {
          agent: agent._id,
          systemPrompt: data.prompt.systemPrompt,
          tags: normalizeTags(data.prompt.tags),
        },
      ],
      { session }
    )

    return {
      agent: agent.toJSON(),
      prompt: prompt.toJSON(),
    }
  })

  return {
    ...agent,
    systemPrompt: prompt.systemPrompt,
  }
}

export async function updateAgent(id: string, data: AgentUpdateInput): Promise<IAgentWithSystemPrompt | null> {
  const updatedAgent = await runWithSession(async session => {
    const agent = await Agent.findOne({ _id: id, deletedAt: null }, null, { session })

    if (!agent) {
      return null
    }

    if (data.name) {
      agent.name = data.name
    }

    if (data.prompt) {
      await Prompt.updateMany({ agent: agent._id, deletedAt: null }, { $set: { deletedAt: new Date() } }).session(
        session
      )

      await Prompt.create(
        [
          {
            agent: agent._id,
            systemPrompt: data.prompt.systemPrompt,
            tags: normalizeTags(data.prompt.tags),
          },
        ],
        { session }
      )
    }

    await agent.save({ session, validateModifiedOnly: true })

    return agent.toJSON()
  })

  if (!updatedAgent) {
    return null
  }

  const systemPrompt = await getSystemPrompt(updatedAgent._id)

  return {
    ...updatedAgent,
    systemPrompt,
  }
}

export async function appendAgentPrompt(
  id: string,
  data: AgentPromptCreateInput
): Promise<IAgentWithSystemPrompt | null> {
  const agent = await Agent.findOne({ _id: id, deletedAt: null }).lean()

  if (!agent) {
    return null
  }

  const createdPrompt = await Prompt.create({
    agent: agent._id,
    systemPrompt: data.systemPrompt,
    tags: normalizeTags(data.tags),
  })

  return {
    ...agent,
    systemPrompt: createdPrompt.systemPrompt,
  }
}

export async function deleteAgent(id: string): Promise<boolean> {
  const agent = await Agent.findOne({ _id: id, deletedAt: null })

  if (!agent) {
    return false
  }

  const deletedAt = new Date()

  await Prompt.updateMany({ agent: agent._id, deletedAt: null }, { $set: { deletedAt } }).lean()
  agent.deletedAt = deletedAt
  await agent.save({ validateBeforeSave: false })

  return true
}
