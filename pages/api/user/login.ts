import type { NextRequest } from 'next/server'
import { isSameOrigin, readJson } from '../../../lib/security'
import { sessionResponse } from '../../../lib/session'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
  if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

  const { email, password, otp } = await readJson(req)

  if (typeof email !== 'string' || typeof password !== 'string') return new Response(null, { status: 400 })

  const loginResponse = await fetch(`${DB_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, otp: typeof otp === 'string' && otp ? otp : undefined })
  })

  return sessionResponse(loginResponse)
}
