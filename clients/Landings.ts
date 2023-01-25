import { Landing } from "../interfaces/Landing"

const LANDINGS_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/landings`

export default class Landings {

  static async get({slugs, basicData}: {slugs?: boolean, basicData?: boolean}) {
    let isFinished = false
    let offset = 0
    const querySlugs = slugs ? '&fields=slug' : ''
    const queryBasicData = basicData ? '&fields=name,services,region,slug,country,languages,logo,id,description,team_size,payment_methods' : ''

    const landings: Landing[] = []
    while (!isFinished) {
      try {
        const response = await fetch(`${LANDINGS_URL}?offset=${offset}${querySlugs}${queryBasicData}`)
        const data = (await response.json()).data as Landing[]
        if (data.length === 0) {
          isFinished = true
        } else {
          offset += data.length
        }
        landings.push(...data)
      } catch (error) {
        console.log('error', error)
      }
    }
    return landings
  }

  static async getLandingData(searchParams: string) {
    let landings: Landing[] = []

    try {
      const response = await fetch(`${LANDINGS_URL}${searchParams}`)

      landings = (await response.json()).data as Landing[]
    } catch (error) {
      console.log('error getting landing data', error)
    }
    return landings[0]
  }

  static async getAllSlugs() {
    const landings = await this.get({slugs: true})

    return landings.map((landing) => {
      return {
        params: {
          slug: landing.slug,
        },
      }
    })
  }
}
