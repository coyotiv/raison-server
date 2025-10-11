import { ZodError } from 'zod'

export function formatZodError(error: ZodError<unknown>): string {
  const { formErrors, fieldErrors } = error.flatten()
  const fieldMessages = Object.entries(fieldErrors ?? {}).flatMap(([field, messages]) => {
    const currentMessages: string[] = Array.isArray(messages) ? messages : []
    return currentMessages.map((message) => `${field}: ${message}`)
  })

  return [...(formErrors ?? []), ...fieldMessages].join(', ')
}