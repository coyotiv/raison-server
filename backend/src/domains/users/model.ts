import { Schema, model, type HydratedDocument, type Model, type InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

export type User = InferSchemaType<typeof userSchema>
export type UserDocument = HydratedDocument<User>
export type UserModel = Model<User>

export const User = model<User, UserModel>('User', userSchema)

export default User
