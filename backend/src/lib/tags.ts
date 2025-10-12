export const DEFAULT_PROMPT_TAG = 'default'

export function normalizeTags(tags?: string[]): string[] {
  if (!Array.isArray(tags)) {
    return [DEFAULT_PROMPT_TAG]
  }

  const normalized = tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  const unique = Array.from(new Set(normalized))

  return unique.length > 0 ? unique : [DEFAULT_PROMPT_TAG]
}

export function normalizeTagsOptional(tags?: string[]): string[] | undefined {
  if (tags === undefined) {
    return undefined
  }
  return normalizeTags(tags)
}
