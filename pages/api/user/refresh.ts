import type { NextRequest } from 'next/server'
import { getSession, isSameOrigin } from '../../../lib/security'
import { clearSessionHeaders, sessionResponse } from '../../../lib/session'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
  if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

  const refresh_token = getSession(req)?.refresh_token

  if (!refresh_token) return new Response(null, { status: 401, headers: clearSessionHeaders() })

  const refreshResponse = await fetch(`${DB_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh_token }),
  })

  return sessionResponse(refreshResponse)
}
