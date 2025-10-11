const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    prompts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', autopopulate: true }],
  },
  { timestamps: true }
)

agentSchema.virtual('systemPrompt', {
  ref: 'Prompt',
  localField: '_id',
  foreignField: 'agent',
  justOne: true,
  limit: 1,
  sort: { createdAt: -1 },
  options: { autopopulate: true },
})

// Include virtuals when converting to JSON / Object
agentSchema.set('toJSON', { virtuals: true })
agentSchema.set('toObject', { virtuals: true })

agentSchema.plugin(autopopulate)

module.exports = mongoose.model('Agent', agentSchema)
