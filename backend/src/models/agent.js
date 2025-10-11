const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    prompts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', autopopulate: true }],
  },
  { timestamps: true }
)

agentSchema.virtual('systemPrompt').get(function () {
  if (!this.prompts || this.prompts.length === 0) {
    return null
  }
  // Get the latest prompt by updatedAt
  const latestPrompt = this.prompts.reduce((latest, current) => {
    if (!latest) return current
    const latestDate = latest.updatedAt || latest.createdAt
    const currentDate = current.updatedAt || current.createdAt
    return currentDate > latestDate ? current : latest
  }, null)

  return latestPrompt ? latestPrompt.systemPrompt : null
})

// Include virtuals when converting to JSON / Object
agentSchema.set('toJSON', { virtuals: true })
agentSchema.set('toObject', { virtuals: true })

agentSchema.plugin(autopopulate)

module.exports = mongoose.model('Agent', agentSchema)
