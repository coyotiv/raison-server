import { Schema, model, type Types } from 'mongoose'
import { DEFAULT_PROMPT_TAG, normalizeTags } from '@/lib/tags'

export interface IPrompt {
  agent: Types.ObjectId
  systemPrompt: string
  tags: string[]
  deletedAt: Date | null

  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const promptSchema = new Schema<IPrompt>(
  {
    agent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    systemPrompt: { type: String, required: true },
    tags: {
      type: [String],
      default: [DEFAULT_PROMPT_TAG],
      set: (tags: string[]) => normalizeTags(tags),
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const Prompt = model<IPrompt>('Prompt', promptSchema)

export default Prompt
