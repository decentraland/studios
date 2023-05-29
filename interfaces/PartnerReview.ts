import { VerifiedPartner } from "./VerifiedPartner"

export interface PartnerReview {
  id: number
  date_created: Date
  name: string
  email: string
  company: string
  review: string
  profile: VerifiedPartner
  uuid: string
  verified_mail: boolean
}
