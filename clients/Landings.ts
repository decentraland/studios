import { Landing } from "../interfaces/Landing"
import { fetchItemsWithRetry } from "../lib/cms"
import { readJsonResponse } from "../lib/security"

const LANDINGS_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/landings`

export default class Landings {

  static async get() {
    let isFinished = false
    let offset = 0

    const landings: Landing[] = []
    while (!isFinished) {
      try {
        const data = await fetchItemsWithRetry<Landing>(`${LANDINGS_URL}?offset=${offset}`)
        if (data.length === 0) {
          isFinished = true
        } else {
          offset += data.length
        }
        landings.push(...data)
      } catch (error) {
        console.log('error', error)
        // Retrying the same offset would loop forever while the CMS is unreachable
        throw error
      }
    }
    return landings
  }

  static async getLandingData(slug: string) {
    let landings: Landing[] = []

    if (typeof slug !== 'string' || !slug) return undefined

    try {
      const response = await fetch(`${LANDINGS_URL}?filter[slug][_eq]=${encodeURIComponent(slug)}`)

      landings = (await readJsonResponse(response))?.data || []
    } catch (error) {
      console.log('error getting landing data', error)
    }
    return landings[0]
  }

  static async getAllSlugs() {
    const landings = await this.get()

    return landings.map((landing) => {
      return {
        params: {
          slug: landing.slug,
        },
      }
    })
  }
}
