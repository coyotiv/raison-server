import User from './model.js'
import type { UserDocument } from './model.js'
import type { UserCreateInput, UserUpdateInput } from './validators.js'

export async function listUsers(): Promise<UserDocument[]> {
  const users = await User.find()
  return users as UserDocument[]
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  const user = await User.findById(id)
  return user as UserDocument | null
}

export async function createUser(data: UserCreateInput): Promise<UserDocument> {
  const user = await User.create({ name: data.name })
  return user as UserDocument
}

export async function updateUser(id: string, data: UserUpdateInput): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })

  return user as UserDocument | null
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await User.findByIdAndDelete(id)
  return Boolean(result)
}
