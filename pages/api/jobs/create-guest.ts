import type { NextRequest } from 'next/server'
import { isUUID } from '../../../components/utils'
import { parseJobInput, sendJobVerificationEmail } from '../../../lib/jobs'
import { getRequestGeo } from '../../../lib/request'
import { discardResponse, isValidVerificationToken, isVerificationTokenConfigured, readJson, readJsonResponse } from '../../../lib/security'
import { getClientIp, turnstileRejected, verifyTurnstile } from '../../../lib/turnstile'

export const config = {
  runtime: 'edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

/**
 * Returns the id of the job created first, ordered by creation date and then by id so parallel requests agree on it.
 */
function oldestJobId(jobs: { id: string, date_created?: string | null }[]) {
  const createdAt = (job: { date_created?: string | null }) => {
    const time = job.date_created ? Date.parse(job.date_created) : NaN
    return Number.isNaN(time) ? Infinity : time
  }
  const [oldest] = [...jobs].sort((a, b) => (createdAt(a) - createdAt(b)) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  return oldest?.id
}

/**
 * Creates the job of a visitor who just signed up from the job form. The job stays unverified until the link emailed
 * to the account's address is opened, which also sets the account's password and activates it (see jobs/verify).
 * Requires the guest token the signup answered with, so only the client that created the draft user can add its job.
 */
export default async function createGuest(req: NextRequest) {
  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const { job: rawJob, userId, guestToken, turnstileToken } = await readJson(req)

  if (!await verifyTurnstile(turnstileToken, getClientIp(req), 'job')) return turnstileRejected()

  const job = parseJobInput(rawJob)

  if (!job || typeof userId !== 'string' || !isUUID(userId)) return new Response(null, { status: 400 })

  // Checking the guest token and signing the verification link can only fail without a secret: check it before
  // anything is read or created
  if (!isVerificationTokenConfigured()) return new Response(null, { status: 500 })

  if (!(await isValidVerificationToken('guest-job', userId, guestToken))) return new Response(null, { status: 401 })

  try {
    const user = await fetch(`${DB_URL}/users/${userId}?fields=id,email,first_name,last_name,company,status,role.name`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    }).then(readJsonResponse).then(res => res?.data)

    // Only the pending sign up the job form just created: active accounts must log in to publish
    if (!user?.id || user.id !== userId || user.status !== 'draft' || user.role?.name !== 'Client' || !user.email) {
      return new Response(null, { status: 400 })
    }

    // One unverified job per draft account, so the guest token can't be used to send repeated emails to the address
    const pendingJobs = await fetch(`${DB_URL}/items/jobs?filter[email][_eq]=${encodeURIComponent(user.email)}&filter[verified_email][_eq]=false&fields=id&limit=1`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    }).then(readJsonResponse)

    if (!Array.isArray(pendingJobs?.data)) return new Response(null, { status: 400 })
    if (pendingJobs.data.length) return new Response(null, { status: 409 })

    const createJob = await fetch(`${DB_URL}/items/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        ...job,
        email: user.email,
        author_name: `${user.first_name} ${user.last_name}`,
        company: user.company,
        short_description: (job.short_description as string[]).join('\n'),
        deadline_date: job.deadline_date || null,
        verified_email: false,
        geo: getRequestGeo(req)
      })
    })
      .then(readJsonResponse)
      .then(body => body?.data)

    if (!createJob?.id) return new Response(null, { status: 400 })

    // Parallel requests with the same guest token can all pass the check above before any of them inserts. Only the
    // oldest unverified job survives and sends its email; the others remove the job they just created.
    const unverifiedJobs = await fetch(`${DB_URL}/items/jobs?filter[email][_eq]=${encodeURIComponent(user.email)}&filter[verified_email][_eq]=false&fields=id,date_created&limit=-1`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    }).then(readJsonResponse).then(res => res?.data)

    // Without the list there's no telling whether a parallel request sends an email too: keep the job without sending
    // one, and let the owner get it from the signup page's resend link
    if (!Array.isArray(unverifiedJobs)) {
      console.log('API guest job create: unverified jobs recheck failed ', createJob.id)
      return new Response(JSON.stringify({ emailSent: false }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (oldestJobId(unverifiedJobs) !== createJob.id) {
      await fetch(`${DB_URL}/items/jobs/${createJob.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      })
        .then(discardResponse)
        .then(res => !res.ok && console.log('API guest job create: duplicate job removal failed, status ', res.status))
        .catch(error => console.log('API guest job create: duplicate job removal failed ', error))

      return new Response(null, { status: 409 })
    }

    // The job exists from here on: a failed email is reported, not answered with an error a client would retry
    const emailSent = await sendJobVerificationEmail(createJob, { mode: 'guest', firstName: user.first_name }).catch((error) => {
      console.log('API guest job create: verification email failed ', error)
      return false
    })

    return new Response(JSON.stringify({ emailSent }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.log('API guest job create error: ', error)
    return new Response(null, { status: 400 })
  }
}
