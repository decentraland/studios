import type { NextRequest } from 'next/server'
import Projects from '../../../clients/Projects'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
  const newData = await Projects.get({basicData: true})
  return new Response(JSON.stringify(newData))
}