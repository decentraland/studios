import { VerifiedPartner } from '../interfaces/VerifiedPartner'
import { fetchItemsWithRetry } from '../lib/cms'
import { readJsonResponse } from '../lib/security'
import { chunk, uniqueStrings } from '../lib/users'

const VERIFIED_PARTNERS_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/profile`

export default class Partners {
  static Url = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL || ''

  static async get() {
    let isFinished = false
    let offset = 0

    const queryFields = '&fields=name,services,region,slug,country,languages,logo,id,description,team_size,payment_methods,reviews.name,reviews.company,reviews.review,projects'
    let partners: VerifiedPartner[] = []

    while (!isFinished) {
      try {
        const data = await fetchItemsWithRetry<VerifiedPartner>(`${VERIFIED_PARTNERS_URL}?offset=${offset}${queryFields}`)
        if (data.length === 0) {
          isFinished = true
        } else {
          offset += data.length
        }
        partners.push(...data)
      } catch (error) {
        console.log('error', error)
        // Retrying the same offset would loop forever while the CMS is unreachable
        throw error
      }
    }
    
    partners = partners.map(partner => ({... partner, description: partner.description.substring(0,300)}))
    
    return partners
  }

  static async getPartnerData(partnerData: { slug?: unknown, user?: unknown }, fields?: string) {
    const filters = (['slug', 'user'] as const)
      .filter(key => typeof partnerData?.[key] === 'string' && partnerData[key])
      .map(key => `filter[${key}][_eq]=${encodeURIComponent(partnerData[key] as string)}`)

    if (!filters.length) return undefined

    const query = filters.join('&')
    
    const basicFields = 'services,projects,reviews,email,name,profile_header,logo,website,marketplace,discord,opensea,twitter,instagram,linkedin,youtube,description,region,country,team_size,languages,payment_methods,slug' 
    const extraFields  = 'reviews.name,reviews.company,reviews.review,projects.image_1,projects.id,projects.title,projects.profile.name,projects.profile.slug,projects.profile.logo,projects.date_created'
    let fieldsFilter = [basicFields, extraFields].join(',')

    if (fields) fieldsFilter = fields

    let partner
    try {
      const data = await fetch(`${VERIFIED_PARTNERS_URL}?${query}&fields=${fieldsFilter}`).then(readJsonResponse).then(body => body?.data)

      partner = data?.[0] as VerifiedPartner
    } catch (error) {
      console.log('error getting partners', error)
    }
    if (partner && partner.projects){
      partner.projects = partner.projects.sort((p1,p2) => p2.id - p1.id)
    }

    return partner
  }

  /**
   * Returns the studio profile of each user, keyed by user id, with one request per chunk of users
   * instead of one per user. Like `getPartnerData`, the first profile of a user wins.
   * `fields` must include `user`.
   */
  static async getPartnersByUsers(users: unknown[], fields: string) {
    const partners = new Map<string, VerifiedPartner>()

    const results = await Promise.all(chunk(uniqueStrings(users)).map(async group => {
      const filter = encodeURIComponent(JSON.stringify({ user: { _in: group } }))
      try {
        const data = await fetch(`${VERIFIED_PARTNERS_URL}?filter=${filter}&fields=${fields}&limit=-1`).then(readJsonResponse).then(body => body?.data)
        return (Array.isArray(data) ? data : []) as VerifiedPartner[]
      } catch (error) {
        console.log('error getting partners', error)
        return []
      }
    }))

    for (const partner of results.flat()) {
      const user = (partner as VerifiedPartner & { user?: unknown }).user
      if (typeof user === 'string' && !partners.has(user)) partners.set(user, partner)
    }

    return partners
  }

  static async getAllSlugs() {
    const partners = await this.get()

    return partners.map((partner) => {
      return {
        params: {
          slug: partner.slug,
        },
      }
    })
  }
}
