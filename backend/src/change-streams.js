/* eslint-disable no-console */
const Agent = require('./models/agent')

module.exports = (io) => {
  // Watch Agent collection for changes
  const agentChangeStream = Agent.watch()

  agentChangeStream.on('change', (change) => {
    console.log('[change-stream] Agent change detected:', change.operationType)
    
    // Emit agents event to all connected clients
    io.emit('agents', {
      operationType: change.operationType,
      documentKey: change.documentKey,
      fullDocument: change.fullDocument,
      updateDescription: change.updateDescription,
    })
  })

  agentChangeStream.on('error', (error) => {
    console.error('[change-stream] Agent change stream error:', error)
  })

  console.log('[change-stream] Agent change stream initialized')
}
