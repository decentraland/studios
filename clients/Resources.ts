import { Resource } from "../interfaces/Resource"
import { fetchItemsWithRetry } from "../lib/cms"

const RESOURCES_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/resources`

export default class Resources {

  static async get() {
    let isFinished = false
    let offset = 0
    
    const resources: Resource[] = []
    while (!isFinished) {
      try {
        const data = await fetchItemsWithRetry<Resource>(`${RESOURCES_URL}?offset=${offset}&sort[]=-date_created`)
        if (data.length === 0) {
          isFinished = true
        } else {
          offset += data.length
        }
        resources.push(...data)
      } catch (error) {
        console.log('error', error)
        // Retrying the same offset would loop forever while the CMS is unreachable
        throw error
      }
    }

    return resources
  }

}
