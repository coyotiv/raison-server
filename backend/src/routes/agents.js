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

router.get('/', async (req, res, next) => {
  try {
    const parsedQuery = agentListQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({ message: parsedQuery.error.flatten().formErrors.join(', ') })
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
      return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
    }

    const parsedQuery = agentListQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({ message: parsedQuery.error.flatten().formErrors.join(', ') })
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
      return res.status(400).json({ message: parsedBody.error.flatten().formErrors.join(', ') })
    }

    const agent = await Agent.create({ name: parsedBody.data.name })
    const populatedAgent = await Agent.findById(agent._id)

    return res.status(201).json(populatedAgent)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const parsedParams = agentIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
    }

    const parsedBody = agentUpdateSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ message: parsedBody.error.flatten().formErrors.join(', ') })
    }

    const agent = await Agent.findByIdAndUpdate(
      parsedParams.data.id,
      { name: parsedBody.data.name },
      { new: true, runValidators: true }
    )

    if (!agent) {
      return res.sendStatus(404)
    }

    return res.json(agent)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/prompts', async (req, res, next) => {
  try {
    const parsedParams = agentIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
    }

    const parsedBody = agentPromptCreateSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ message: parsedBody.error.flatten().formErrors.join(', ') })
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
      return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
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
