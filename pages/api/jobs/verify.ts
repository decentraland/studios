import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const { id } = await req.json()

  return fetch(`${DB_URL}/items/jobs/${id}`, {
      method: 'PATCH',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        verified_email: true
      })
  })    
}