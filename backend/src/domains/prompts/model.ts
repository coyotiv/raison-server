import {
  Schema,
  model,
  type HydratedDocument,
  type Model,
  type InferSchemaType,
  type UpdateQuery,
  type ClientSession,
  type Query,
  Types,
} from 'mongoose'

import { DEFAULT_PROMPT_TAG, normalizeTags } from '@/lib/tags'
import Agent, { type AgentModel } from '@/domains/agents/model'
import { softDeleteDocumentById, type SoftDeleteOptions } from '@/lib/soft-delete'

const promptRevisionSchema = new Schema(
  {
    promptId: { type: Schema.Types.ObjectId, ref: 'Prompt', required: true, immutable: true },
    version: { type: Number, required: true, immutable: true },
    systemPrompt: { type: String, required: true, immutable: true },
    tags: { type: [String], required: true, immutable: true },
  },
  { timestamps: true }
)

promptRevisionSchema.index({ promptId: 1, version: -1 }, { unique: true })

export type PromptRevision = InferSchemaType<typeof promptRevisionSchema>
export type PromptRevisionDocument = HydratedDocument<PromptRevision>
export type PromptRevisionModel = Model<PromptRevision>

export const PromptRevision = model<PromptRevision, PromptRevisionModel>('PromptRevision', promptRevisionSchema)

const promptSchema = new Schema(
  {
    agent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    systemPrompt: { type: String, required: true },
    version: { type: Number, default: 1 },
    tags: {
      type: [String],
      default: () => [DEFAULT_PROMPT_TAG],
      set: normalizeTags,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

promptSchema.index({ agent: 1, version: -1 })

type PromptAttributes = InferSchemaType<typeof promptSchema>
export type Prompt = PromptAttributes
export type PromptDocument = HydratedDocument<Prompt>
export type PromptModel = Model<Prompt>

type MaybeSession = ClientSession | null

type PromptQuery<ResultType = PromptDocument | null> = Query<ResultType, PromptDocument, PromptModel>

type RevisionTrackingQuery = PromptQuery & { _createRevision?: boolean }

function normalizeAgentId(value: unknown): Types.ObjectId | null {
  if (!value) return null
  if (value instanceof Types.ObjectId) return value

  try {
    return new Types.ObjectId(String(value))
  } catch {
    return null
  }
}

function updateTouchesVersionedFields(update?: UpdateQuery<PromptAttributes> | unknown): boolean {
  if (!update || Array.isArray(update)) return false

  const updateQuery = update as UpdateQuery<PromptAttributes>
  const setFields = (updateQuery.$set ?? updateQuery) as Record<string, unknown>
  const unsetFields = updateQuery.$unset as Record<string, unknown> | undefined

  return (
    setFields.systemPrompt !== undefined ||
    setFields.tags !== undefined ||
    unsetFields?.systemPrompt !== undefined ||
    unsetFields?.tags !== undefined
  )
}

function updateTouchesAgentFacingFields(update?: UpdateQuery<PromptAttributes> | unknown): boolean {
  if (!update || Array.isArray(update)) return false

  const updateQuery = update as UpdateQuery<PromptAttributes>
  const setFields = (updateQuery.$set ?? updateQuery) as Record<string, unknown>
  const unsetFields = updateQuery.$unset as Record<string, unknown> | undefined

  return (
    updateTouchesVersionedFields(update) ||
    setFields.deletedAt !== undefined ||
    unsetFields?.deletedAt !== undefined ||
    setFields.version !== undefined
  )
}

async function createRevisionFromDoc(doc: PromptDocument, session: MaybeSession) {
  const revision = new PromptRevision({
    promptId: doc._id,
    version: doc.version,
    systemPrompt: doc.systemPrompt,
    tags: doc.tags,
  })

  await revision.save(session ? { session } : undefined)
}

async function syncAgentSystemPrompt(promptModel: PromptModel, agentId: Types.ObjectId, session: MaybeSession) {
  const latestPromptQuery = promptModel
    .findOne({ agent: agentId, deletedAt: null })
    .sort({ version: -1, updatedAt: -1, createdAt: -1 })
    .select({ systemPrompt: 1 })
    .lean<{ systemPrompt?: string }>()

  if (session) latestPromptQuery.session(session)

  const latestPrompt = await latestPromptQuery

  const agentUpdateQuery = (Agent as AgentModel).updateOne(
    { _id: agentId },
    { $set: { systemPrompt: latestPrompt?.systemPrompt ?? null } }
  )

  if (session) agentUpdateQuery.session(session)

  await agentUpdateQuery.exec()
}

async function syncAgentsMatchingQuery(query: PromptQuery, session: MaybeSession) {
  const promptModel = query.model as PromptModel
  const distinctAgentIdsQuery = promptModel.distinct('agent', query.getFilter())

  if (session) distinctAgentIdsQuery.session(session)

  const distinctAgentValues = await distinctAgentIdsQuery.exec()
  const agentIds = (distinctAgentValues as unknown[])
    .map(normalizeAgentId)
    .filter((id): id is Types.ObjectId => id !== null)

  if (!agentIds.length) return

  await Promise.all(agentIds.map(id => syncAgentSystemPrompt(promptModel, id, session)))
}

promptSchema.pre('save', function (this: PromptDocument, next) {
  ;(this.$locals ??= {}).wasNew = this.isNew
  next()
})

promptSchema.post('save', async function (doc: PromptDocument) {
  const session = (doc.$session?.() ?? null) as MaybeSession

  if (doc.$locals?.wasNew) await createRevisionFromDoc(doc, session)

  const agentId = normalizeAgentId(doc.agent)
  if (!agentId) return

  await syncAgentSystemPrompt(doc.constructor as PromptModel, agentId, session)
})

promptSchema.pre('findOneAndUpdate', function () {
  const query = this as RevisionTrackingQuery

  this.setOptions({ new: true, runValidators: true, returnDocument: 'after' })

  const update = this.getUpdate() as UpdateQuery<PromptAttributes> | undefined
  if (!updateTouchesVersionedFields(update)) return

  const inc = Object.assign({}, update?.$inc as Record<string, number> | undefined)
  inc.version = (inc.version ?? 0) + 1

  this.setUpdate({ ...(update ?? {}), $inc: inc })
  query._createRevision = true
})

promptSchema.post('findOneAndUpdate', async function (doc: PromptDocument | null) {
  if (!doc) return

  const session = (this.getOptions().session ?? null) as MaybeSession
  const query = this as RevisionTrackingQuery

  if (query._createRevision) {
    await createRevisionFromDoc(doc, session)
    query._createRevision = false
  }

  const agentId = normalizeAgentId(doc.agent)
  if (!agentId) return

  await syncAgentSystemPrompt(this.model as PromptModel, agentId, session)
})

promptSchema.pre(['updateOne', 'updateMany'], function () {
  const update = this.getUpdate() as UpdateQuery<PromptAttributes> | undefined
  if (!updateTouchesVersionedFields(update)) return

  const inc = Object.assign({}, update?.$inc as Record<string, number> | undefined)
  inc.version = (inc.version ?? 0) + 1

  this.setUpdate({ ...(update ?? {}), $inc: inc })
})

promptSchema.post('updateOne', async function (this: PromptQuery) {
  const session = (this.getOptions().session ?? null) as MaybeSession
  if (!updateTouchesAgentFacingFields(this.getUpdate())) return
  await syncAgentsMatchingQuery(this, session)
})

promptSchema.post('updateMany', async function (this: PromptQuery) {
  const session = (this.getOptions().session ?? null) as MaybeSession
  if (!updateTouchesAgentFacingFields(this.getUpdate())) return
  await syncAgentsMatchingQuery(this, session)
})

export async function softDeletePromptById(
  id: Types.ObjectId | string,
  options: SoftDeleteOptions = {}
): Promise<PromptDocument | null> {
  const deleted = await softDeleteDocumentById(Prompt, id, options)
  return deleted as PromptDocument | null
}

export const Prompt = model<Prompt, PromptModel>('Prompt', promptSchema)
export default Prompt
