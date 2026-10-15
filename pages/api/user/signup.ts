import type { NextRequest } from 'next/server'
import { isBoundedString, isEmail, isVerificationTokenConfigured, pick, readJson } from '../../../lib/security'
import { getClientIp, turnstileRejected, verifyTurnstile } from '../../../lib/turnstile'
import { sendUserVerificationEmail } from '../../../lib/userVerification'

export const config = {
  runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const CLIENT_ROLE = '525f6b3a-0379-4636-ad16-4c719283c2b5'

const SIGNUP_FIELDS = ['email', 'password', 'first_name', 'last_name', 'company', 'user_agent'] as const

export default async function (req: NextRequest) {
  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const reqBody = await readJson(req)

  if (!await verifyTurnstile(reqBody.turnstileToken, getClientIp(req), 'signup')) return turnstileRejected()

  const userData = pick(reqBody, SIGNUP_FIELDS)

  if (!isEmail(userData.email) || typeof userData.password !== 'string' || !userData.password) {
    return new Response(null, { status: 400 })
  }

  for (const field of ['first_name', 'last_name', 'company', 'user_agent'] as const) {
    if (userData[field] !== undefined && !isBoundedString(userData[field], 512)) return new Response(null, { status: 400 })
  }

  // Signing the verification link can only fail without a secret: check it before a draft user is created
  if (reqBody.email_verification && !isVerificationTokenConfigured()) return new Response(null, { status: 500 })

  let createUser = await fetch(`${DB_URL}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...userData,
      status: 'draft',
      role: CLIENT_ROLE,
      geo: req.geo
    })
  })
    .then(res => res.json())

  if (createUser.errors || !createUser.data?.id) return new Response(null, { status: 400 })

  const createdUser = {
    first_name: createUser.data.first_name,
    last_name: createUser.data.last_name,
    company: createUser.data.company,
    email: createUser.data.email
  }

  if (!reqBody.email_verification) return new Response(JSON.stringify(createdUser))

  const emailSent = await sendUserVerificationEmail({ id: createUser.data.id, ...createdUser }).catch((error) => {
    console.error('Failed to send the verification email', error)
    return false
  })

  // The user exists either way: report the unsent email so the form can offer to resend it instead of a signup error
  return new Response(JSON.stringify({ ...createdUser, emailSent }))

}
