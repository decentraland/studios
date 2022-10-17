import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import type { NextApiRequest, NextApiResponse } from 'next'

const VERIFIED_PARTNERS_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/profile`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifiedPartner[] | { error: unknown }>
) {
  let isFinished = false
  let offset = 0
  const partners: VerifiedPartner[] = []
  while (!isFinished) {
    try {
      const response = await fetch(`${VERIFIED_PARTNERS_URL}?offset=${offset}`)
      const data = (await response.json()).data as VerifiedPartner[]
      if (data.length === 0) {
        isFinished = true
      } else {
        offset += data.length
        partners.push(...data)
      }
    } catch (error) {
      return res.status(500).json({ error })
    }
  }

  return res.status(200).json(partners)
}
