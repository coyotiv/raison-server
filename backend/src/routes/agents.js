const express = require('express')
const mongoose = require('mongoose')
const Agent = require('../models/agent')
require('../models/prompt')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const { version } = req.query
    if (version !== undefined) {
      const agents = await Agent.find({}, null, { autopopulate: false }).populate({
        path: 'prompts',
        match: { version: String(version) },
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
    const { id } = req.params
    const { version } = req.query
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid agent id' })
    }
    if (version !== undefined) {
      const agent = await Agent.findById(id, null, { autopopulate: false }).populate({
        path: 'prompts',
        match: { version: String(version) },
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

module.exports = router
