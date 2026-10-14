import { VerifiedPartner } from '../interfaces/VerifiedPartner'
import { readJsonResponse } from '../lib/security'

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
        const response = await fetch(`${VERIFIED_PARTNERS_URL}?offset=${offset}${queryFields}`)
        const data = (await readJsonResponse(response)).data as VerifiedPartner[]
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
