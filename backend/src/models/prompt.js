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
    version: {
      type: String,
      default: function () {
        // Use MongoDB ObjectId timestamp as the default version string
        const ts = this && this._id && this._id.getTimestamp ? this._id.getTimestamp() : this.createdAt || new Date()
        return new Date(ts).toISOString()
      },
      immutable: true,
    },
  },
  { timestamps: true }
)

promptSchema.plugin(autopopulate)

module.exports = mongoose.model('Prompt', promptSchema)
