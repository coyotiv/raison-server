import { Schema, model, type HydratedDocument, type Model, type InferSchemaType, Types } from 'mongoose'
import autopopulate from 'mongoose-autopopulate'

import type { Prompt } from '@/domains/prompts/model'
import { softDeleteDocumentById, type SoftDeleteOptions } from '@/lib/soft-delete'

const agentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    prompts: [{ type: Schema.Types.ObjectId, ref: 'Prompt', autopopulate: { match: { deletedAt: null } } }],
    systemPrompt: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

agentSchema.plugin(autopopulate)

export type Agent = InferSchemaType<typeof agentSchema>
export type PopulatedAgent = Omit<Agent, 'prompts'> & {
  _id: Types.ObjectId | string
  prompts: Prompt[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
export type AgentDocument = HydratedDocument<Agent>
export type AgentModel = Model<Agent>

export const Agent = model<Agent, AgentModel>('Agent', agentSchema)

export default Agent

export async function softDeleteAgentById(
  id: Types.ObjectId | string,
  options: SoftDeleteOptions = {}
): Promise<AgentDocument | null> {
  const deleted = await softDeleteDocumentById(Agent, id, options)
  return deleted as AgentDocument | null
}
