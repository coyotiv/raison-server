/* eslint-disable no-console */
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

import Agent, { type AgentDocument } from '@/domains/agents/model'
import Prompt from '@/domains/prompts/model'
import { DEFAULT_PROMPT_TAG, normalizeTags } from '@/lib/tags'

type SeedPrompt = {
  systemPrompt: string
  version?: string | number
  tags?: string[]
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

function uniqueTags(tags: string[]): string[] {
  return Array.from(new Set(tags))
}

function resolveVersion(version: SeedPrompt['version'], fallback: number): number {
  if (typeof version === 'number' && Number.isFinite(version)) {
    return version
  }

  if (typeof version === 'string') {
    const parsed = Number(version)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function resolveTags(prompt: SeedPrompt, index: number): string[] {
  const allowEmpty = index > 0
  const normalized = prompt.tags ? normalizeTags(prompt.tags, { allowEmpty }) : allowEmpty ? [] : [DEFAULT_PROMPT_TAG]

  if (allowEmpty) {
    return uniqueTags(normalized.filter((tag) => tag !== DEFAULT_PROMPT_TAG))
  }

  const withDefault = normalized.includes(DEFAULT_PROMPT_TAG)
    ? normalized
    : [DEFAULT_PROMPT_TAG, ...normalized]

  return uniqueTags(withDefault)
}

function serializePrompt(prompt: SeedPrompt, agentId: AgentDocument['_id'], index: number) {
  return {
    agent: agentId,
    systemPrompt: prompt.systemPrompt,
    tags: resolveTags(prompt, index),
    version: resolveVersion(prompt.version, index),
    deletedAt: null,
  }
}

async function resolveSeedPath(filePath: string): Promise<string> {
  const cwd = process.cwd()
  const parentDir = path.resolve(cwd, '..')

  const candidates = new Set<string>()

  if (path.isAbsolute(filePath)) {
    candidates.add(filePath)

    const relativeToCwd = path.relative(cwd, filePath)
    if (!relativeToCwd.startsWith('..')) {
      candidates.add(path.resolve(parentDir, relativeToCwd))
    }
  } else {
    candidates.add(path.resolve(cwd, filePath))
  }

  candidates.add(path.resolve(parentDir, filePath))

  for (const candidate of candidates) {
    try {
      await stat(candidate)
      return candidate
    } catch {
      // try next candidate
    }
  }

  throw new Error(`Seed file not found. Checked paths: ${Array.from(candidates).join(', ')}`)
}

export async function seedFromFile(filePath: string): Promise<{ ok: boolean }> {
  const absolutePath = await resolveSeedPath(filePath)

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
      .map((prompt: SeedPrompt, index: number) => serializePrompt(prompt, agent._id, index))

    if (prompts.length) {
      const createdPrompts = await Prompt.insertMany(prompts, { ordered: true })
      agent.prompts = createdPrompts.map((prompt) => prompt._id)
      await agent.save()
    }
  }

  return { ok: true }
}

export default { seedFromFile }
