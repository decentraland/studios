import type { NextRequest } from 'next/server'
import { getSession, isSameOrigin } from '../../../lib/security'
import { clearSessionHeaders, refreshFailureStatus, sessionResponse } from '../../../lib/session'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
  if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

  const refresh_token = getSession(req)?.refresh_token

  if (!refresh_token) return new Response(null, { status: 401, headers: clearSessionHeaders() })

  let refreshResponse: Response
  try {
    refreshResponse = await fetch(`${DB_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token }),
    })
  } catch (error) {
    console.log('API Refresh error: ', error)
    return new Response(null, { status: 503 })
  }

  // Cookies are kept even when the token is rejected: Directus rotates refresh tokens, so another tab
  // may have just refreshed and stored a newer session. The client decides whether it is logged out.
  if (!refreshResponse.ok) {
    await refreshResponse.body?.cancel()
    return new Response(null, { status: refreshFailureStatus(refreshResponse.status) })
  }

  return sessionResponse(refreshResponse)
}
