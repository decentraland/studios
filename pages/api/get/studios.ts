import type { NextRequest } from 'next/server'
import Partners from '../../../clients/Partners'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {
  const newData = await Partners.get()
  return new Response(JSON.stringify(newData))
}