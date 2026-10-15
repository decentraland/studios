const RETRY_DELAY_MS = 1000
const REQUEST_TIMEOUT_MS = 15000

// Aborts the request (including reading the body) if it takes longer than REQUEST_TIMEOUT_MS
async function fetchItems<T>(url: string): Promise<T[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      await response.body?.cancel()
      throw new Error(`CMS request failed with status ${response.status}: ${url}`)
    }
    const data = (await response.json()).data
    if (!Array.isArray(data)) throw new Error(`CMS response has no data: ${url}`)
    return data as T[]
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`CMS request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

// Fetches a page of CMS items, retrying once after a short delay so a single transient
// error or timeout doesn't fail the build
export async function fetchItemsWithRetry<T>(url: string): Promise<T[]> {
  try {
    return await fetchItems<T>(url)
  } catch (error) {
    console.log('error, retrying', error)
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    return fetchItems<T>(url)
  }
}
