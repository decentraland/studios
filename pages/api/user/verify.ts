import type { NextRequest } from 'next/server'
import { isUUID } from '../../../components/utils'
import { isValidVerificationToken, readJson } from '../../../lib/security'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest) {
  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const { id, token } = await readJson(req)

  if (typeof id !== 'string' || !isUUID(id) || !(await isValidVerificationToken('user', id, token))) {
    return new Response(null, { status: 400 })
  }

  const user = await fetch(`${DB_URL}/users/${id}?fields=status`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  }).then(res => res.ok && res.json()).then(res => res && res.data)

  if (user?.status === 'active') return new Response(null, { status: 204 })

  // Only pending sign ups can be activated: suspended or archived accounts must stay that way
  if (user?.status !== 'draft') return new Response(null, { status: 400 })

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
