import type { NextRequest } from 'next/server'
import Projects from '../../../clients/Projects'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
    const body = await req.json()
    const { id } = body;

    if (typeof(id) !== 'number') {
      return new Response(null, { status: 400 })
  }

    const newData = await Projects.getProject(id)
    
    return new Response(JSON.stringify(newData))
}