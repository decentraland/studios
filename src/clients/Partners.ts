import { VerifiedPartner } from '../interfaces/VerifiedPartner'

const VERIFIED_PARTNERS_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/profile`

export default class Partners {
  static Url = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL || ''

  static async get(slugs = false) {
    let isFinished = false
    let offset = 0
    const querySlugs = slugs ? '&fields=slug' : ''

    const partners: VerifiedPartner[] = []
    while (!isFinished) {
      try {
        const response = await fetch(`${VERIFIED_PARTNERS_URL}?offset=${offset}${querySlugs}`)
        const data = (await response.json()).data as VerifiedPartner[]
        if (data.length === 0) {
          isFinished = true
        } else {
          offset += data.length
        }
        partners.push(...data)
      } catch (error) {
        console.log('error', error)
      }
    }

    return partners
  }

  static async getPartnerData(slug: string) {
    let partners: VerifiedPartner[] = []

    try {
      const response = await fetch(`${VERIFIED_PARTNERS_URL}?filter[slug]=${slug}`)

      partners = (await response.json()).data as VerifiedPartner[]
    } catch (error) {
      console.log('error', error)
    }

    return partners[0]
  }

  static async getAllSlugs() {
    const partners = await this.get(true)

    return partners.map((partner) => {
      return {
        params: {
          slug: partner.slug,
        },
      }
    })
  }
}
