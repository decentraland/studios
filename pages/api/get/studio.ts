import type { NextRequest } from 'next/server'
import Partners from '../../../clients/Partners';
import Projects from '../../../clients/Projects';

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
    const body = await req.json()
    const { slug, id } = body;

    const studio = await Partners.getPartnerData(`?filter[slug]=${slug}`)
    const projects = await Projects.getProject(`?filter[profile]=${id}&sort[]=-date_created`)
    const reviews = await Partners.getReviews(id)

    return new Response(JSON.stringify({studio, projects, reviews}))
}