import { Schema, model, HydratedDocument, Model, InferSchemaType } from 'mongoose'
import autopopulate from 'mongoose-autopopulate'
import { DEFAULT_PROMPT_TAG, normalizeTags } from '@/lib/tags'

const promptSchema = new Schema(
  {
    agent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    systemPrompt: { type: String, required: true },
    tags: {
      type: [String],
      default: () => [DEFAULT_PROMPT_TAG],
      set: normalizeTags,
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
