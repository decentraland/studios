import type { NextRequest } from 'next/server'
import { getSession, isSameOrigin } from '../../../lib/security'
import { clearSessionHeaders } from '../../../lib/session'

export const config = {
  runtime: 'edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
  if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

  const session = getSession(req)

  if (session?.refresh_token) {
    // The local session is cleared even when Directus can't revoke the refresh token.
    // No Authorization header: an expired access token would make Directus reject the revocation.
    try {
      const res = await fetch(`${DB_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      })
      await res.body?.cancel()
    } catch (error) {
      console.log('API Logout error: ', error)
    }
  }

  return new Response(null, { status: 204, headers: clearSessionHeaders() })
}
