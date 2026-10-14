import type { NextRequest } from 'next/server'
import Partners from '../../../clients/Partners';
import { readJson } from '../../../lib/security';

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
    const { slug, user } = await readJson(req)

    const studio = await Partners.getPartnerData({ slug, user })

    return new Response(JSON.stringify(studio || {}))
}