import type { NextRequest } from 'next/server'
import { getSession, isSameOrigin } from '../../../lib/security'
import { clearSessionHeaders } from '../../../lib/session'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
  if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

  const session = getSession(req)

  if (session?.access_token && session.refresh_token) {
    await fetch(`${DB_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    })
  }

  return new Response(null, { status: 204, headers: clearSessionHeaders() })
}
