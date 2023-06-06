import type { NextRequest } from 'next/server'
import Landings from '../../../clients/Landings';

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
    const body = await req.json()
    const { slug } = body;

    const newData = await Landings.getLandingData(`?filter[slug]=${slug}`)
    return new Response(JSON.stringify(newData))
}