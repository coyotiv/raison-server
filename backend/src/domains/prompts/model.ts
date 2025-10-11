import { Schema, model, HydratedDocument, Model, InferSchemaType } from 'mongoose'
import autopopulate from 'mongoose-autopopulate'

const promptSchema = new Schema(
  {
    agent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    systemPrompt: { type: String, required: true },
    version: {
      type: String,
      default: function defaultVersion(this: PromptDocument) {
        const timestamp = this._id?.getTimestamp?.() ?? this.createdAt ?? new Date()
        return new Date(timestamp).toISOString()
      },
      immutable: true,
    },
  },
  { timestamps: true }
)

promptSchema.plugin(autopopulate)

export type Prompt = InferSchemaType<typeof promptSchema>
export type PromptDocument = HydratedDocument<Prompt>
export type PromptModel = Model<Prompt>

export const Prompt = model<Prompt, PromptModel>('Prompt', promptSchema)

export default Prompt
