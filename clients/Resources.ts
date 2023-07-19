import { Resource } from "../interfaces/Resource"

const RESOURCES_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/resources`

export default class Resources {

  static async get() {
    let isFinished = false
    let offset = 0
    
    const resources: Resource[] = []
    while (!isFinished) {
      try {
        const response = await fetch(`${RESOURCES_URL}?offset=${offset}&filter[resource_type]=Scene&sort[]=-date_created`)
        const data = (await response.json()).data as Resource[]
        if (data.length === 0) {
          isFinished = true
        } else {
          offset += data.length
        }
        resources.push(...data)
      } catch (error) {
        console.log('error', error)
      }
    }

    return resources
  }

}
