const express = require('express')
const mongoose = require('mongoose')
const Agent = require('../models/agent')
require('../models/prompt')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const agents = await Agent.find()
    res.json(agents)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid agent id' })
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
