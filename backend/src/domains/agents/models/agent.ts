import { Schema, model, type Types } from 'mongoose'

export interface IAgent {
  name: string
  deletedAt: Date | null

  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface IAgentWithSystemPrompt extends IAgent {
  systemPrompt: string | null
}

const agentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, trim: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const Agent = model<IAgent>('Agent', agentSchema)

export default Agent
