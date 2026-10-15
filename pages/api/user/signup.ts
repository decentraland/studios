import type { NextRequest } from 'next/server'
import { createVerificationToken, GUEST_JOB_TOKEN_TTL, isBoundedString, isEmail, isVerificationTokenConfigured, normalizeEmail, pick, readJson } from '../../../lib/security'
import { getClientIp, turnstileRejected, verifyTurnstile } from '../../../lib/turnstile'
import { sendUserVerificationEmail } from '../../../lib/userVerification'

export const config = {
  runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const CLIENT_ROLE = '525f6b3a-0379-4636-ad16-4c719283c2b5'

// No password: it's set by whoever verifies the email, so nobody can pre-register someone else's address
const SIGNUP_FIELDS = ['email', 'first_name', 'last_name', 'company', 'user_agent'] as const

export default async function (req: NextRequest) {
  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const reqBody = await readJson(req)

  if (!await verifyTurnstile(reqBody.turnstileToken, getClientIp(req), 'signup')) return turnstileRejected()

  const userData = pick(reqBody, SIGNUP_FIELDS)

  if (!isEmail(userData.email)) {
    return new Response(null, { status: 400 })
  }

  // Stored lowercased so later lookups by email (resend, guest jobs, invites) match regardless of casing
  userData.email = normalizeEmail(userData.email)

  for (const field of ['first_name', 'last_name', 'company', 'user_agent'] as const) {
    if (userData[field] !== undefined && !isBoundedString(userData[field], 512)) return new Response(null, { status: 400 })
  }

  // Signing the verification link or the guest token can only fail without a secret: check it before a draft user is created
  if (!isVerificationTokenConfigured()) return new Response(null, { status: 500 })

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

  // Signed up from the job form: the short-lived guest token lets this client (and only it) attach one job to the new
  // draft user, so knowing someone's email isn't enough to send them job verification emails
  if (!reqBody.email_verification) {
    return new Response(JSON.stringify({
      ...createdUser,
      id: createUser.data.id,
      guestToken: await createVerificationToken('guest-job', createUser.data.id, GUEST_JOB_TOKEN_TTL)
    }))
  }

  const emailSent = await sendUserVerificationEmail({ id: createUser.data.id, ...createdUser }).catch((error) => {
    console.error('Failed to send the verification email', error)
    return false
  })

  // The user exists either way: report the unsent email so the form can offer to resend it instead of a signup error
  return new Response(JSON.stringify({ ...createdUser, emailSent }))

}
