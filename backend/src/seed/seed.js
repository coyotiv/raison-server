/* eslint-disable no-console */
const fs = require('fs/promises')
const path = require('path')
const Agent = require('../models/agent')
const Prompt = require('../models/prompt')

async function seedFromFile(filePath) {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)

  const raw = await fs.readFile(absolutePath, 'utf8')
  const data = JSON.parse(raw)

  if (!data || !Array.isArray(data.agents)) {
    throw new Error('Invalid seed JSON: missing "agents" array')
  }

  for (const a of data.agents) {
    if (!a || !a.name) continue

    const name = a.name.trim()

    const agent = await Agent.findOneAndUpdate(
      { name },
      { name },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    const prompts = Array.isArray(a.prompts) ? a.prompts : []
    if (prompts.length) {
      for (const p of prompts) {
        if (!p || !p.systemPrompt) continue
        const filter = {
          agent: agent._id,
          systemPrompt: p.systemPrompt,
        }
        if (p.version) {
          filter.version = String(p.version)
        }
        await Prompt.findOneAndUpdate(
          filter,
          {
            agent: agent._id,
            systemPrompt: p.systemPrompt,
            // If version provided, set it; otherwise let schema default apply
            ...(p.version ? { version: String(p.version) } : {}),
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        )
      }
    }
  }

  return { ok: true }
}

module.exports = { seedFromFile }
