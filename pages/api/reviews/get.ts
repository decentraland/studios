import type { NextRequest } from 'next/server'
import Partners from '../../../clients/Partners'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
    const body = await req.json()
    const partnerId = body.partnerId;

    const reviews = await Partners.getReviews(partnerId)

    return new Response(JSON.stringify(reviews))
  }