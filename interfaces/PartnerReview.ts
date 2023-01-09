export interface PartnerReviewResponse {
  data: PartnerReview[]
}

export interface PartnerReview {
  id: number
  date_created: Date
  name: string
  email: string
  company: string
  review: string
  profile: number
  uuid: string
}
