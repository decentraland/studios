import { VerifiedPartner } from '../interfaces/VerifiedPartner'

const VERIFIED_PARTNERS_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/profile`

export default class Partners {
  static Url = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL || ''

  static async get() {
    let isFinished = false
    let offset = 0

    const queryFields = '&fields=name,services,region,slug,country,languages,logo,id,description,team_size,payment_methods,reviews,projects'
    let partners: VerifiedPartner[] = []

    while (!isFinished) {
      try {
        const response = await fetch(`${VERIFIED_PARTNERS_URL}?offset=${offset}${queryFields}`)
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
    
    partners = partners.map(partner => ({... partner, description: partner.description.substring(0,300)}))
    
    return partners
  }

  static async getPartnerData(slug: string) {
    let partner

    try {
      const response = await fetch(`${VERIFIED_PARTNERS_URL}?filter[slug]=${slug}&fields=*,reviews.*,projects.image_1,projects.id,projects.title,projects.profile.name,projects.profile.slug,projects.profile.logo,projects.date_created`)

      partner = (await response.json()).data[0] as VerifiedPartner
    } catch (error) {
      console.log('error getting partners', error)
    }
    if (partner){
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
