import { Schema, model, HydratedDocument, Model, InferSchemaType, Types } from 'mongoose'
import autopopulate from 'mongoose-autopopulate'
import type { PromptDocument } from '../prompts/model'

const agentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    prompts: [{ type: Schema.Types.ObjectId, ref: 'Prompt', autopopulate: true }],
  },
  { timestamps: true }
)

agentSchema.virtual('systemPrompt').get(function getSystemPrompt(this: AgentDocument) {
  const prompts = (this.prompts ?? []) as Array<PromptDocument | Types.ObjectId>

  let latestPrompt: PromptDocument | null = null

  for (const promptRef of prompts) {
    if (promptRef instanceof Types.ObjectId) {
      continue
    }

    const candidate = promptRef
    const candidateDate = candidate.updatedAt ?? candidate.createdAt ?? new Date(0)

    if (!latestPrompt) {
      latestPrompt = candidate
      continue
    }

    const latestDate = latestPrompt.updatedAt ?? latestPrompt.createdAt ?? new Date(0)

    if (candidateDate > latestDate) {
      latestPrompt = candidate
    }
  }

  return latestPrompt?.systemPrompt ?? null
})

agentSchema.set('toJSON', { virtuals: true })
agentSchema.set('toObject', { virtuals: true })

agentSchema.plugin(autopopulate)

export type Agent = InferSchemaType<typeof agentSchema>
export type AgentDocument = HydratedDocument<Agent>
export type AgentModel = Model<Agent>

export const Agent = model<Agent, AgentModel>('Agent', agentSchema)

export default Agent
