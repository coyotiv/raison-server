/* eslint-disable no-console */
const mongoose = require('mongoose')
const Agent = require('./models/agent')
const Prompt = require('./models/prompt')

let agentChangeStream
let promptChangeStream

function startAgentChangeStream(io) {
  if (agentChangeStream) {
    return agentChangeStream
  }

  agentChangeStream = Agent.watch([], { fullDocument: 'updateLookup' })

  agentChangeStream.on('change', async (change) => {
    console.log('[change-stream] Agent change detected:', change.operationType)

    let fullDocument = change.fullDocument

    if (change.operationType === 'update' && change.documentKey?._id) {
      try {
        const doc = await Agent.findById(change.documentKey._id)
        if (doc) {
          fullDocument = doc.toObject()
        }
      } catch (err) {
        console.error('[change-stream] Error fetching updated document:', err)
      }
    }

    if ((change.operationType === 'insert' || change.operationType === 'replace') && fullDocument) {
      try {
        const doc = new Agent(fullDocument)
        fullDocument = doc.toObject()
      } catch (err) {
        console.error('[change-stream] Error converting document:', err)
      }
    }

    io.emit('agents', {
      operationType: change.operationType,
      documentKey: change.documentKey,
      fullDocument,
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

function startPromptChangeStream(io) {
  if (promptChangeStream) {
    return promptChangeStream
  }

  promptChangeStream = Prompt.watch([], { fullDocument: 'updateLookup' })

  promptChangeStream.on('change', async (change) => {
    console.log('[change-stream] Prompt change detected:', change.operationType)

    let agentId = null
    if (change.fullDocument?.agent) {
      agentId = change.fullDocument.agent
    } else if (change.operationType === 'delete' && change.documentKey?._id) {
      // For deletes, we need to fetch the prompt before it was deleted from updateDescription
      // Since we can't get it anymore, we'll need to emit based on what we know
      // This is a limitation - we'll handle it by just logging
      console.log('[change-stream] Prompt deleted, cannot determine agent')
      return
    }

    if (!agentId) {
      console.log('[change-stream] No agent ID found for prompt change')
      return
    }

    // Fetch the related agent with updated virtual fields
    try {
      const agent = await Agent.findById(agentId)
      if (agent) {
        io.emit('agents', {
          operationType: 'update',
          documentKey: { _id: agentId },
          fullDocument: agent.toObject(),
          updateDescription: {
            updatedFields: { prompts: agent.prompts, systemPrompt: agent.systemPrompt },
          },
        })
        console.log(`[change-stream] Emitted agent update for prompt change: ${agentId}`)
      }
    } catch (err) {
      console.error('[change-stream] Error fetching agent for prompt change:', err)
    }
  })

  promptChangeStream.on('error', (error) => {
    console.error('[change-stream] Prompt change stream error:', error)

    if (promptChangeStream) {
      promptChangeStream.close().catch(() => {})
      promptChangeStream = null
    }

    // Attempt to restart the change stream
    initializePromptChangeStream(io)
  })

  console.log('[change-stream] Prompt change stream initialized')

  return promptChangeStream
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

function initializePromptChangeStream(io) {
  if (promptChangeStream) {
    return promptChangeStream
  }

  if (mongoose.connection.readyState === 1) {
    return startPromptChangeStream(io)
  }

  mongoose.connection.once('open', () => {
    startPromptChangeStream(io)
  })

  return promptChangeStream
}

function initializeChangeStreams(io) {
  initializeAgentChangeStream(io)
  initializePromptChangeStream(io)
}

function setupSocketIO(ioInstance) {
  // Initialize change streams with the Socket.IO instance
  initializeChangeStreams(ioInstance)

  // Setup Socket.IO connection handler
  ioInstance.on('connection', async socket => {
    // eslint-disable-next-line no-console
    console.log(`[socket.io] Client connected: ${socket.id}`)

    // Send all existing agents to the newly connected client in one event
    try {
      const agents = await Agent.find()
      const agentObjects = agents.map(agent => agent.toJSON())

      socket.emit('agents.initial', {
        type: 'agents.initial',
        at: new Date().toISOString(),
        agents: agentObjects,
      })

      // eslint-disable-next-line no-console
      console.log(`[socket.io] Sent ${agents.length} agents to client ${socket.id}`)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[socket.io] Error sending initial agents to client ${socket.id}:`, error)
    }
  })
}

module.exports = {
  initializeAgentChangeStream,
  initializePromptChangeStream,
  initializeChangeStreams,
  setupSocketIO,
}