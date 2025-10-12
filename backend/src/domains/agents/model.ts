import { Schema, model, type HydratedDocument, type Model, type InferSchemaType, Types } from 'mongoose'
import autopopulate from 'mongoose-autopopulate'

import type { Prompt, PromptDocument } from '@/domains/prompts/model'
import { DEFAULT_PROMPT_TAG } from '@/lib/tags'


const agentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    prompts: [{ type: Schema.Types.ObjectId, ref: 'Prompt', autopopulate: { match: { deletedAt: null } } }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

agentSchema.virtual('systemPrompt').get(function getSystemPrompt(this: AgentDocument) {
  const prompts = (this.prompts ?? []) as Array<PromptDocument | Types.ObjectId>

  const materializedPrompts = prompts.filter(
    (prompt): prompt is PromptDocument => !(prompt instanceof Types.ObjectId)
  )

  if (materializedPrompts.length === 0) {
    return null
  }

  function selectLatest(candidates: PromptDocument[]): PromptDocument | null {
    return candidates.reduce<PromptDocument | null>((latest, candidate) => {
      const candidateDate = candidate.updatedAt ?? candidate.createdAt ?? new Date(0)
      if (!latest) {
        return candidate
      }
      const latestDate = latest.updatedAt ?? latest.createdAt ?? new Date(0)
      return candidateDate > latestDate ? candidate : latest
    }, null)
  }

  const defaultTaggedPrompts = materializedPrompts.filter(
    (prompt) => Array.isArray(prompt.tags) && prompt.tags.includes(DEFAULT_PROMPT_TAG)
  )

  const chosenPrompt = selectLatest(defaultTaggedPrompts.length > 0 ? defaultTaggedPrompts : materializedPrompts)

  return chosenPrompt?.systemPrompt ?? null
})

agentSchema.set('toJSON', { virtuals: true })
agentSchema.set('toObject', { virtuals: true })

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
