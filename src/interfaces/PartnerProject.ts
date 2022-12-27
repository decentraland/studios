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
  image_1: string | null
  image_2: string | null
  image_3: string | null
  image_4: string | null
  image_5: string | null
  video_1: string | null
  video_2: string | null
}
