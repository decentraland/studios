export interface PartnerReviewResponse {
  data: PartnerReview[]
}

export interface PartnerReview {
  id: number
  date_created: Date
  user_updated: null
  date_updated: null
  name: string
  email: string
  company: string
  review: string
  profile: number
  verified_mail: boolean | null
  uuid: string
}
