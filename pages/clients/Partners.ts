import { VerifiedPartner } from "../interfaces/VerifiedPartner"

export default class Partners {
  static Url = process.env.NEXT_PUBLIC_BASE_URL || ''

  static async fetch<T>(path: string): Promise<T> {
    const response = await fetch(`${this.Url}/api${path}`)
    return (await response.json()) as T
  }

  static async get() {
    return this.fetch<VerifiedPartner[]>('/partners')
  }
}