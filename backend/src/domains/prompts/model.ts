import { Schema, model, type HydratedDocument, type Model, type InferSchemaType } from 'mongoose'
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
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export type Prompt = InferSchemaType<typeof promptSchema>
export type PromptDocument = HydratedDocument<Prompt>
export type PromptModel = Model<Prompt>

export const Prompt = model<Prompt, PromptModel>('Prompt', promptSchema)

export default Prompt
