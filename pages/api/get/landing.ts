import type { NextRequest } from 'next/server'
import Landings from '../../../clients/Landings';
import { readJson } from '../../../lib/security';

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
    const { slug } = await readJson(req)

    const newData = await Landings.getLandingData(slug)
    return new Response(JSON.stringify(newData || {}))
}