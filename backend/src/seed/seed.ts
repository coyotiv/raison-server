/* eslint-disable no-console */
import { readFile } from 'fs/promises'
import path from 'path'
import Agent, { AgentDocument } from '../domains/agents/model'
import Prompt from '../domains/prompts/model'

type SeedPrompt = {
  systemPrompt: string
  version?: string | number
}

type SeedAgent = {
  name: string
  prompts?: SeedPrompt[]
}

type SeedFile = {
  agents: SeedAgent[]
}

function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (Array.isArray(value)) {
    return value
  }
  if (value === undefined || value === null) {
    return []
  }
  return [value]
}

function serializePrompt(prompt: SeedPrompt, agentId: AgentDocument['_id']) {
  return {
    agent: agentId,
    systemPrompt: prompt.systemPrompt,
    ...(prompt.version ? { version: String(prompt.version) } : {}),
  }
}

export async function seedFromFile(filePath: string): Promise<{ ok: boolean }> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)

  const raw = await readFile(absolutePath, 'utf8')
  const data = JSON.parse(raw) as SeedFile

  if (!data || !Array.isArray(data.agents)) {
    throw new Error('Invalid seed JSON: missing "agents" array')
  }

  await Prompt.deleteMany({})
  await Agent.deleteMany({})

  for (const seedAgent of data.agents) {
    if (!seedAgent || !seedAgent.name) {
      continue
    }

    const name = seedAgent.name.trim()
    if (!name) {
      continue
    }

    const agent = await Agent.create({ name })

    const prompts = ensureArray(seedAgent.prompts)
      .filter((prompt): prompt is SeedPrompt => Boolean(prompt?.systemPrompt))
      .map((prompt) => serializePrompt(prompt, agent._id))

    if (prompts.length) {
      const createdPrompts = await Prompt.insertMany(prompts, { ordered: true })
      agent.prompts = createdPrompts.map((prompt) => prompt._id)
      await agent.save()
    }
  }

  return { ok: true }
}

export default { seedFromFile }
