import type { NextRequest } from 'next/server'
import { isEmail, readJson, readJsonResponse } from '../../../lib/security'
import { getClientIp, turnstileRejected, verifyTurnstile } from '../../../lib/turnstile'
import { sendUserVerificationEmail } from '../../../lib/userVerification'

export const config = {
  runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

// Resends the verification email of a signup that hasn't been verified yet
export default async function resend(req: NextRequest) {
  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const { email, turnstileToken } = await readJson(req)

  if (!await verifyTurnstile(turnstileToken, getClientIp(req), 'resend')) return turnstileRejected()

  if (!isEmail(email)) return new Response(null, { status: 400 })

  try {
    const getUser = await fetch(`${DB_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id,status,email,first_name,last_name,company&limit=1`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      }
    })
    const user = (await readJsonResponse(getUser))?.data?.[0]

    if (user?.id && user.status === 'draft') await sendUserVerificationEmail(user)
  } catch (error) {
    console.error('Failed to resend the verification email', error)
  }

  // Same answer whether or not the account exists or still needs verifying
  return new Response(null, { status: 204 })
}
