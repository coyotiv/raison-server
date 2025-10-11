import { Schema, model, HydratedDocument, Model, InferSchemaType } from 'mongoose'
import autopopulate from 'mongoose-autopopulate'

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

userSchema.plugin(autopopulate)

export type User = InferSchemaType<typeof userSchema>
export type UserDocument = HydratedDocument<User>
export type UserModel = Model<User>

export const User = model<User, UserModel>('User', userSchema)

export default User
