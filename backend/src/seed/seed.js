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

  await Prompt.deleteMany({})
  await Agent.deleteMany({})

  for (const a of data.agents) {
    if (!a || !a.name) continue

    const name = a.name.trim()
    if (!name) continue

    const agent = await Agent.create({ name })

    const prompts = Array.isArray(a.prompts) ? a.prompts : []
    if (prompts.length) {
      const promptDocs = prompts
        .filter((p) => p && p.systemPrompt)
        .map((p) => ({
          agent: agent._id,
          systemPrompt: p.systemPrompt,
          ...(p.version ? { version: String(p.version) } : {}),
        }))

      if (promptDocs.length) {
        const createdPrompts = await Prompt.insertMany(promptDocs, { ordered: true })
        // Update Agent's prompts array with the created prompt IDs
        agent.prompts = createdPrompts.map((p) => p._id)
        await agent.save()
      }
    }
  }

  return { ok: true }
}

module.exports = { seedFromFile }
