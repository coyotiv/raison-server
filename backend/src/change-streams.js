/* eslint-disable no-console */
const mongoose = require('mongoose')
const Agent = require('./models/agent')

let agentChangeStream

function startAgentChangeStream(io) {
  if (agentChangeStream) {
    return agentChangeStream
  }

  agentChangeStream = Agent.watch([], { fullDocument: 'updateLookup' })

  agentChangeStream.on('change', (change) => {
    console.log('[change-stream] Agent change detected:', change.operationType)

    io.emit('agents', {
      operationType: change.operationType,
      documentKey: change.documentKey,
      fullDocument: change.fullDocument,
      updateDescription: change.updateDescription,
    })
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
