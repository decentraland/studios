import type { NextRequest } from 'next/server'
import Resources from '../../../clients/Resources'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
  const newData = await Resources.get()
  return new Response(JSON.stringify(newData))
}