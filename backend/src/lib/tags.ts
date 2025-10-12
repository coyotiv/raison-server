export const DEFAULT_PROMPT_TAG = 'default'

type NormalizeTagsOptions = {
  allowEmpty?: boolean
}

export function normalizeTags(tags?: string[], options: NormalizeTagsOptions = {}): string[] {
  const { allowEmpty = false } = options

  if (!Array.isArray(tags)) {
    return allowEmpty ? [] : [DEFAULT_PROMPT_TAG]
  }

  const normalized = tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  const unique = Array.from(new Set(normalized))

  if (unique.length > 0) {
    return unique
  }

  return allowEmpty ? [] : [DEFAULT_PROMPT_TAG]
}

export function normalizeTagsOptional(tags?: string[], options: NormalizeTagsOptions = {}): string[] | undefined {
  if (tags === undefined) {
    return undefined
  }
  return normalizeTags(tags, options)
}
