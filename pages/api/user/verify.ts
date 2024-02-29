import type { NextRequest } from 'next/server'
import { isUUID } from '../../../components/utils'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest) {

  const { id } = await req.json()

  if (!isUUID(id)) {
    return new Response(null, { status: 400 })
  }

  const userData = await fetch(`${DB_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        status: "active"
      })
  })

  return new Response(null, {status: userData.ok ? 204 : 400})
}