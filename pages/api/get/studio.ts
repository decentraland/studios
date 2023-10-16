import type { NextRequest } from 'next/server'
import Partners from '../../../clients/Partners';
import Projects from '../../../clients/Projects';

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
    const body = await req.json()

    const studio = await Partners.getPartnerData(body)

    return new Response(JSON.stringify(studio || {}))
}