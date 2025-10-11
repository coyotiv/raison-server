const express = require('express')
const mongoose = require('mongoose')
const Agent = require('../models/agent')
const Prompt = require('../models/prompt')
const {
  agentCreateSchema,
  agentUpdateSchema,
  agentIdParamSchema,
  agentListQuerySchema,
  agentPromptCreateSchema,
} = require('../validators/agent')

const router = express.Router()

function formatZodError(error) {
  const { formErrors, fieldErrors } = error.flatten()
  const fieldMessages = Object.entries(fieldErrors || {}).flatMap(([field, messages]) =>
    (messages || []).map((message) => `${field}: ${message}`)
  )

  return [...(formErrors || []), ...fieldMessages].join(', ')
}

router.get('/', async (req, res, next) => {
  try {
    const parsedQuery = agentListQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({ message: formatZodError(parsedQuery.error) })
    }

    const { version } = parsedQuery.data

    if (version !== undefined) {
      const agents = await Agent.find({}, null, { autopopulate: false }).populate({
        path: 'prompts',
        match: { version },
      })
      return res.json(agents)
    }

    const agents = await Agent.find()
    res.json(agents)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const parsedParams = agentIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ message: formatZodError(parsedParams.error) })
    }

    const parsedQuery = agentListQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({ message: formatZodError(parsedQuery.error) })
    }

    const { id } = parsedParams.data
    const { version } = parsedQuery.data

    if (version !== undefined) {
      const agent = await Agent.findById(id, null, { autopopulate: false }).populate({
        path: 'prompts',
        match: { version },
      })
      if (!agent) return res.sendStatus(404)
      return res.json(agent)
    }
    const agent = await Agent.findById(id)
    if (!agent) {
      return res.sendStatus(404)
    }
    res.json(agent)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const parsedBody = agentCreateSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ message: formatZodError(parsedBody.error) })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const [agent] = await Agent.create([{ name: parsedBody.data.name }], { session })

      const promptsToCreate = parsedBody.data.prompts.map((prompt) => ({
        agent: agent._id,
        systemPrompt: prompt.systemPrompt,
        ...(prompt.version ? { version: prompt.version } : {}),
      }))

      const createdPrompts = await Prompt.create(promptsToCreate, { session })
      agent.prompts = createdPrompts.map((prompt) => prompt._id)

      await agent.save({ session })

      await session.commitTransaction()
      session.endSession()

      const populatedAgent = await Agent.findById(agent._id)

      return res.status(201).json(populatedAgent)
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      throw error
    }
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const parsedParams = agentIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ message: formatZodError(parsedParams.error) })
    }

    const parsedBody = agentUpdateSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ message: formatZodError(parsedBody.error) })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const agent = await Agent.findById(parsedParams.data.id).session(session)

      if (!agent) {
        await session.abortTransaction()
        session.endSession()
        return res.sendStatus(404)
      }

      agent.name = parsedBody.data.name

      if (parsedBody.data.prompts) {
        await Prompt.deleteMany({ agent: agent._id }).session(session)

        const createdPrompts = await Prompt.create(
          parsedBody.data.prompts.map((prompt) => ({
            agent: agent._id,
            systemPrompt: prompt.systemPrompt,
            ...(prompt.version ? { version: prompt.version } : {}),
          })),
          { session }
        )

        agent.prompts = createdPrompts.map((prompt) => prompt._id)
      }

      await agent.save({ session, validateModifiedOnly: true })

      await session.commitTransaction()
      session.endSession()

      const populatedAgent = await Agent.findById(agent._id)

      return res.json(populatedAgent)
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      throw error
    }
  } catch (err) {
    next(err)
  }
})

router.post('/:id/prompts', async (req, res, next) => {
  try {
    const parsedParams = agentIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ message: formatZodError(parsedParams.error) })
    }

    const parsedBody = agentPromptCreateSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ message: formatZodError(parsedBody.error) })
    }

    const agent = await Agent.findById(parsedParams.data.id)

    if (!agent) {
      return res.sendStatus(404)
    }

    await Prompt.create({
      agent: agent._id,
      systemPrompt: parsedBody.data.systemPrompt,
      ...(parsedBody.data.version ? { version: parsedBody.data.version } : {}),
    })

    const updatedAgent = await Agent.findById(agent._id)

    return res.status(201).json(updatedAgent)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const parsedParams = agentIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ message: formatZodError(parsedParams.error) })
    }

    const agent = await Agent.findById(parsedParams.data.id)

    if (!agent) {
      return res.sendStatus(404)
    }

    await Prompt.deleteMany({ agent: agent._id })
    await Agent.findByIdAndDelete(agent._id)

    return res.sendStatus(204)
  } catch (err) {
    next(err)
  }
})

module.exports = router
