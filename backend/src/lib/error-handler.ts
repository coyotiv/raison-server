import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

export function formatZodError(error: ZodError<unknown>): string {
  const { formErrors, fieldErrors } = error.flatten()
  const fieldMessages = Object.entries(fieldErrors ?? {}).flatMap(([field, messages]) => {
    const currentMessages: string[] = Array.isArray(messages) ? messages : []
    return currentMessages.map(message => `${field}: ${message}`)
  })

  return [...(formErrors ?? []), ...fieldMessages].join(', ')
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err)

  if (err instanceof ZodError) {
    res.status(400).json({ message: formatZodError(err) })
    return
  }

  if (err.status) {
    res.status(err.status).json({ message: err.message })
    return
  }

  res.status(500).json({ message: err.message || 'Internal server error' })
}
