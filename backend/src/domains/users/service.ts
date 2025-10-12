import User, { type UserDocument } from './model'
import type { UserCreateInput, UserUpdateInput } from './validators'

export async function listUsers() {
  const users = await User.find().lean()
  return users as UserDocument[]
}

export async function findUserById(id: string) {
  const user = await User.findById(id).lean()
  return user
}

export async function createUser(data: UserCreateInput) {
  const user = await User.create({ name: data.name })
  return user
}

export async function updateUser(id: string, data: UserUpdateInput) {
  const user = await User.findByIdAndUpdate(id, data, {
    lean: true,
    new: true,
    runValidators: true,
  })

  return user
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await User.findByIdAndDelete(id).lean()
  return Boolean(result)
}
