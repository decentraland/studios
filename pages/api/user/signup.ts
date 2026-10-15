import type { NextRequest } from 'next/server'
import { createVerificationToken, isBoundedString, isEmail, isVerificationTokenConfigured, pick, readJson } from '../../../lib/security'

export const config = {
  runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN
const CLIENT_ROLE = '525f6b3a-0379-4636-ad16-4c719283c2b5'

const SIGNUP_FIELDS = ['email', 'password', 'first_name', 'last_name', 'company', 'user_agent'] as const

export default async function (req: NextRequest) {
  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const reqBody = await readJson(req)
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

  const token = await createVerificationToken('user', createUser.data.id)

  const sendMailVerifications = await fetch(`${SENDRGRID_URL}/mail/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      from: {
        email: "studios@decentraland.org", name: "Decentraland Studios"
      },
      personalizations: [{
        to: [
          { email: createdUser.email, name: createdUser.first_name }
        ],
        dynamic_template_data: {
          ...createdUser,
          verify_url: `https://studios.decentraland.org/user/verify?id=${createUser.data.id}#token=${token}`,
        }
      }],
      template_id: "d-6e4af1c34f6d432bb18b09bf778cae3e"
    })
  })
  await sendMailVerifications.body?.cancel()

  if (sendMailVerifications.ok) return new Response(JSON.stringify(createdUser))

  return new Response(null, { status: 400 })

}
