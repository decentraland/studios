import { readJsonResponse } from './security'

// Keeps each query string well below URL length limits; every chunk is one subrequest
export const MAX_FILTER_VALUES = 50

export function chunk<T>(values: T[], size = MAX_FILTER_VALUES) {
  const chunks: T[][] = []
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size))
  return chunks
}

export function uniqueStrings(values: unknown[]) {
  return Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && !!value)))
}

/**
 * Fetches every Directus user whose `field` is one of `values`, with one request per
 * `MAX_FILTER_VALUES` values instead of one per user. Missing (or deleted) users are simply absent,
 * and a failed request contributes no users.
 */
export async function getUsersBy(field: 'id' | 'email', values: unknown[], fields: string, token: string | undefined) {
  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

  const results = await Promise.all(chunk(uniqueStrings(values)).map(group => {
    // The JSON form of `filter[<field>][_in]=...`, so values containing commas can't split the list
    const filter = encodeURIComponent(JSON.stringify({ [field]: { _in: group } }))
    return fetch(`${DB_URL}/users?filter=${filter}&fields=${fields}&limit=-1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(readJsonResponse).then(body => (Array.isArray(body?.data) ? body.data : []) as Record<string, any>[])
  }))

  return results.flat()
}
