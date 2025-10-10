const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const promptSchema = new mongoose.Schema(
  {
    systemPrompt: { type: String, required: true },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
  },
  { timestamps: true }
)

promptSchema.plugin(autopopulate)

module.exports = mongoose.model('Prompt', promptSchema)
