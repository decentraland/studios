export interface PartnerProjectResponse {
  data: PartnerProject[]
}

export interface PartnerProject {
  id: number
  user_created: string
  date_created: Date
  user_updated: string | null
  date_updated: Date | null
  title: string
  description: string
  link: string | null
  profile: number
  image_1: string
  image_2: null | string
  image_3: null | string
  image_4: null | string
  image_5: null | string
}
