import { VerifiedPartner } from '../interfaces/VerifiedPartner'
import type { NextApiRequest, NextApiResponse } from 'next'

const VERIFIED_PARTNERS_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}/items/profile`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifiedPartner | { error: any }>
) {
  try {
    const response = await fetch(VERIFIED_PARTNERS_URL)
    res.status(200).json((await response.json()).data)
  } catch (error) {
    res.status(500).json({ error })
  }
}
