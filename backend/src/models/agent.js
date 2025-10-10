const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

// Virtual relation: an Agent has many Prompts
agentSchema.virtual('prompts', {
  ref: 'Prompt',
  localField: '_id',
  foreignField: 'agent',
  justOne: false,
  options: { autopopulate: true },
})

// Include virtuals when converting to JSON / Object
agentSchema.set('toJSON', { virtuals: true })
agentSchema.set('toObject', { virtuals: true })

agentSchema.plugin(autopopulate)

module.exports = mongoose.model('Agent', agentSchema)
