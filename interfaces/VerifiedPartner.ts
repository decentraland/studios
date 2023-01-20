export interface VerifiedPartnerResponse {
  data: VerifiedPartner[]
}

export interface VerifiedPartner {
  id: number
  date_created: string
  date_updated: string
  name: string
  description: string
  logo: string
  team_size: TeamSize
  services: Service[]
  region: Region
  country: string
  languages: string[]
  payment_methods: PaymentMethod[]
  website: null | string
  youtube: null | string
  email: null | string
  twitter: null | string
  instagram: null | string
  linkedin: null | string
  discord: null | string
  opensea: null | string
  sketchfab: null | string
  parcel: null | string
  marketplace: null | string
  status: Status
  user: string
  slug: string
}

export enum PaymentMethod {
  WireTransfer = 'Wire Transfer',
  CreditCard = 'Credit Card',
  Crypto = 'Crypto',
  // PayPal = 'PayPal',
}

export enum Region {
  NorthAmerica = 'North America',
  Europe = 'Europe',
  LatinAmerica = 'Latin America',
  Asia = 'Asia',
  Oceania = 'Oceania',
  Africa = 'Africa',
}

export enum Service {
  '3DModeling' = '3D Modeling',
  Advertisement = 'Advertisement',
  CreativeDirector = 'Creative Director',
  EmoteDesign = 'Emote Design',
  LandRental = 'Land Rental',
  LinkedWearables = 'Linked Wearables',
  Programming = 'Programming',
  VenueRental = 'Venue Rental',
  WearableDesign = 'Wearable Design',
}

export enum Status {
  Published = 'published',
}

export enum TeamSize {
  Individual = 'Individual',
  SmallStudio = 'Small Studio',
  MediumStudio = 'Medium Studio',
  LargeStudio = 'Large Studio',
}
