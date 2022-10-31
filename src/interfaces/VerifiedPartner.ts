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
}

export enum PaymentMethod {
  CreditCard = 'Credit Card',
  Crypto = 'Crypto',
  PayPal = 'PayPal',
  WireTransfer = 'Wire Transfer',
}

export enum Region {
  Africa = 'Africa',
  Asia = 'Asia',
  Europe = 'Europe',
  LatinAmerica = 'Latin America',
  NorthAmerica = 'North America',
  Oceania = 'Oceania',
}

export enum Service {
  '3DModeling' = '3D Modeling',
  Advertising = 'Advertising',
  EmoteDesign = 'Emote Design',
  LandRental = 'Land Rental',
  Programming = 'Programming',
  VenueRental = 'Venue Rental',
  WearableDesign = 'Wearable Design',
}

export enum Status {
  Published = 'published',
}

export enum TeamSize {
  Individual = 'Individual',
  LargeStudio = 'Large Studio',
  MediumStudio = 'Medium Studio',
  SmallStudio = 'Small Studio',
}
