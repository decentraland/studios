import type { NextRequest } from 'next/server'
import Landings from '../../../clients/Landings';
import { readJson } from '../../../lib/security';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';

export const config = {
  runtime: 'edge',
}

export default async function (req: NextRequest) {
    const { slug } = await readJson(req)

    const newData = await Landings.getLandingData(slug)
    if (newData) newData.content1_description = sanitizeHtml(newData.content1_description)
    return new Response(JSON.stringify(newData || {}))
}