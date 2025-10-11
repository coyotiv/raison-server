const express = require('express')
const mongoose = require('mongoose')
const Prompt = require('../models/prompt')
const Agent = require('../models/agent')
const {
  promptListQuerySchema,
  promptCreateSchema,
  promptUpdateSchema,
  promptIdParamSchema,
} = require('../validators/prompt')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const parsedQuery = promptListQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({ message: parsedQuery.error.flatten().formErrors.join(', ') })
    }

    const { agentId } = parsedQuery.data
    const filter = {}

    if (agentId !== undefined) {
      filter.agent = agentId
    }

    const prompts = await Prompt.find(filter).sort({ createdAt: -1 })
    return res.json(prompts)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const parsedParams = promptIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
    }

    const prompt = await Prompt.findById(parsedParams.data.id)

    if (!prompt) {
      return res.sendStatus(404)
    }

    return res.json(prompt)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const parsedBody = promptCreateSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ message: parsedBody.error.flatten().formErrors.join(', ') })
    }

    const agent = await Agent.findById(parsedBody.data.agentId)

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' })
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

router.put('/:id', async (req, res, next) => {
  try {
    const parsedParams = promptIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
    }

    const parsedBody = promptUpdateSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({ message: parsedBody.error.flatten().formErrors.join(', ') })
    }

    const prompt = await Prompt.findByIdAndUpdate(parsedParams.data.id, parsedBody.data, {
      new: true,
      runValidators: true,
    })

    if (!prompt) {
      return res.sendStatus(404)
    }

    const updatedAgent = await Agent.findById(prompt.agent)

    return res.json(updatedAgent)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const parsedParams = promptIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
      return res.status(400).json({ message: parsedParams.error.flatten().formErrors.join(', ') })
    }

    const prompt = await Prompt.findById(parsedParams.data.id)

    if (!prompt) {
      return res.sendStatus(404)
    }

    const agentId = prompt.agent

    await Prompt.findByIdAndDelete(prompt._id)

    const updatedAgent = await Agent.findById(agentId)

    if (!updatedAgent) {
      return res.sendStatus(204)
    }

    return res.json(updatedAgent)
  } catch (err) {
    next(err)
  }
})

module.exports = router
