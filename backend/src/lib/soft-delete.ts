import {
  type Model,
  type HydratedDocument,
  type ClientSession,
  type FilterQuery,
  type UpdateQuery,
  Types,
} from 'mongoose'

export type SoftDeleteOptions = {
  deletedAt?: Date
  session?: ClientSession | null
}

export async function softDeleteDocumentById<T>(
  model: Model<T>,
  id: Types.ObjectId | string,
  options: SoftDeleteOptions = {}
): Promise<HydratedDocument<T> | null> {
  const deletedAt = options.deletedAt ?? new Date()
  const session = options.session ?? null

  const filter: FilterQuery<T> = { _id: id, deletedAt: null } as FilterQuery<T>
  const update: UpdateQuery<T> = { $set: { deletedAt } } as UpdateQuery<T>

  return model
    .findOneAndUpdate(filter, update, {
      new: true,
      session: session ?? undefined,
    })
    .exec()
}
