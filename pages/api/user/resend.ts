import type { NextRequest } from 'next/server'
import { sendJobVerificationEmail } from '../../../lib/jobs'
import { emailInFilter, isEmail, readJson, readJsonResponse } from '../../../lib/security'
import { getClientIp, turnstileRejected, verifyTurnstile } from '../../../lib/turnstile'
import { sendUserVerificationEmail } from '../../../lib/userVerification'

export const config = {
  runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

// Resends the verification email of a signup that hasn't been verified yet (or of its pending job, see below)
export default async function resend(req: NextRequest) {
  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const { email, turnstileToken } = await readJson(req)

  if (!await verifyTurnstile(turnstileToken, getClientIp(req), 'resend')) return turnstileRejected()

  if (!isEmail(email)) return new Response(null, { status: 400 })

  try {
    const getUser = await fetch(`${DB_URL}/users?filter[email][_in]=${emailInFilter(email)}&filter[status][_eq]=draft&fields=id,status,email,first_name,last_name,company&limit=1`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      }
    })
    const user = (await readJsonResponse(getUser))?.data?.[0]

    if (user?.id && user.status === 'draft' && user.email) {
      // Signed up from the job form: the job's link sets the password too, and also publishes the job, so it's the one
      // to resend. Jobs are stored with the account's email as it is in Directus.
      const pendingJobs = await fetch(`${DB_URL}/items/jobs?filter[email][_eq]=${encodeURIComponent(user.email)}&filter[verified_email][_eq]=false&fields=id,email,author_name,title,budget&sort=date_created&limit=1`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
        }
      }).then(readJsonResponse).then(res => res?.data)

      if (!Array.isArray(pendingJobs)) {
        console.error('Failed to look up the pending job of a draft user ', user.id)
      } else if (pendingJobs[0]?.id) {
        await sendJobVerificationEmail(pendingJobs[0], { mode: 'guest', firstName: user.first_name })
      } else {
        await sendUserVerificationEmail(user)
      }
    }
  } catch (error) {
    console.error('Failed to resend the verification email', error)
  }

  // Same answer whether or not the account exists or still needs verifying
  return new Response(null, { status: 204 })
}
