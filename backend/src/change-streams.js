/* eslint-disable no-console */
const mongoose = require('mongoose')
const Agent = require('./models/agent')

let agentChangeStream

function startAgentChangeStream(io) {
  if (agentChangeStream) {
    return agentChangeStream
  }

  agentChangeStream = Agent.watch([], { fullDocument: 'updateLookup' })

  agentChangeStream.on('change', async change => {
    console.log('[change-stream] Agent change detected:', change.operationType)

    // Fetch the full document with populated fields if needed
    let agent = change.fullDocument
    if (!agent && change.documentKey) {
      // For delete operations or when fullDocument is not available
      agent = await Agent.findById(change.documentKey._id)
    }

    if (agent) {
      // Convert to JSON to ensure virtuals are included
      const agentObj = agent.toJSON ? agent.toJSON() : agent

      io.emit('agent.changed', {
        type: 'agent.changed',
        at: new Date().toISOString(),
        agent: agentObj,
      })
    }
  })

  agentChangeStream.on('error', (error) => {
    console.error('[change-stream] Agent change stream error:', error)

    if (agentChangeStream) {
      agentChangeStream.close().catch(() => {})
      agentChangeStream = null
    }

    // Attempt to restart the change stream
    initializeAgentChangeStream(io)
  })

  console.log('[change-stream] Agent change stream initialized')

  return agentChangeStream
}

function initializeAgentChangeStream(io) {
  if (agentChangeStream) {
    return agentChangeStream
  }

  if (mongoose.connection.readyState === 1) {
    return startAgentChangeStream(io)
  }

  mongoose.connection.once('open', () => {
    startAgentChangeStream(io)
  })

  return agentChangeStream
}

module.exports = { initializeAgentChangeStream }
