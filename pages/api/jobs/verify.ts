import type { NextRequest } from 'next/server'
import { budgetToRanges, isUUID } from '../../../components/utils'
import { isValidPassword } from '../../../lib/password'
import { activateDraftUser, deleteUser, getUserStatus, restoreSuspendedDraftUser, suspendDraftUser } from '../../../lib/userVerification'
import { checkVerificationToken, discardResponse, pick, readJson, readJsonResponse } from '../../../lib/security'

export const config = {
  runtime: 'edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

const PUBLIC_JOB_FIELDS = ['id', 'title', 'author_name', 'company', 'short_description', 'long_description', 'budget', 'deadline_date', 'brief_file', 'verified_email'] as const
// Shown to a draft owner above the password form, so they see what they're about to publish
const PENDING_JOB_FIELDS = ['title', 'author_name', 'company', 'short_description', 'long_description', 'budget', 'deadline_date'] as const

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function findJobOwner(email: string): Promise<{ id: string, status: string } | null | undefined> {
  const userLookup = await fetch(`${DB_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id,status&limit=1`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  }).then(readJsonResponse)

  // undefined: the lookup failed. null: there's no such user.
  if (!Array.isArray(userLookup?.data)) return undefined
  return userLookup.data[0]?.id ? userLookup.data[0] : null
}

async function deleteJob(id: string) {
  const res = await fetch(`${DB_URL}/items/jobs/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  })
  await res.body?.cancel()

  return res.ok
}

/**
 * "This wasn't me": whoever received the link of a job created along with a pending account, with their email, removes
 * both. Only a draft owner and an unverified job: an account that was activated, or a job that was published, proves
 * the owner already used the link.
 */
async function decline(currentJob: { id: string, email: string, verified_email?: boolean }) {
  if (currentJob.verified_email) return new Response(null, { status: 400 })

  const user = await findJobOwner(currentJob.email)
  if (user === undefined) return new Response(null, { status: 400 })

  if (user) {
    if (user.status !== 'draft') return new Response(null, { status: 400 })

    // Suspended first, conditionally on it still being a draft, so the job link can't activate it while it's removed
    if (!(await suspendDraftUser(user.id))) return new Response(null, { status: 400 })

    // The account goes first: if removing it fails it's restored, and the job is still there to retry from the link
    if (!(await deleteUser(user.id))) {
      console.log('API Job Verify: declined user removal failed ', user.id)
      if (!(await restoreSuspendedDraftUser(user.id))) console.log('API Job Verify: declined user restore failed ', user.id)
      return new Response(null, { status: 500 })
    }
  }

  // Without an owner (e.g. a retry after removing the job failed) an unverified job can't be published by anyone
  if (!(await deleteJob(currentJob.id))) {
    console.log('API Job Verify: declined job removal failed ', currentJob.id)
    return new Response(null, { status: 500 })
  }

  return jsonResponse({ declined: true })
}

export default async function (req: NextRequest) {

  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const { id, token, password, decline: declined } = await readJson(req)

  if (typeof id !== 'string' || !isUUID(id)) return new Response(null, { status: 400 })

  const tokenStatus = await checkVerificationToken('job', id, token)
  // A real link that's too old: the signup page's resend link sends a new one
  if (tokenStatus === 'expired') return new Response(null, { status: 410 })
  if (tokenStatus !== 'valid') return new Response(null, { status: 400 })

  const currentJob = await fetch(`${DB_URL}/items/jobs/${id}?fields=*,brief_file.id,brief_file.filename_download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  }).then(readJsonResponse).then(res => res?.data)

  if (!currentJob) return new Response(null, { status: 400 })

  if (declined === true) return decline(currentJob)

  const hasPassword = password !== undefined && password !== null && password !== ''

  // Already published, so its owner was activated before: a password sent now wasn't set, the earlier one stays
  if (currentJob.verified_email) {
    return jsonResponse({ ...pick(currentJob, PUBLIC_JOB_FIELDS), ...(hasPassword ? { alreadyActive: true } : {}) })
  }

  const user = await findJobOwner(currentJob.email)

  // A job is only published for an existing owner that is pending or active: a missing, suspended or archived owner
  // must not get a job published (nor announced) through an old link
  if (!user || (user.status !== 'draft' && user.status !== 'active')) return new Response(null, { status: 400 })

  // Set when the request carries a password that wasn't used because the owner had been activated already
  let alreadyActive = hasPassword && user.status === 'active'

  // A draft owner proves they own the email with this link, so they set the password here, before the job is published
  if (user.status === 'draft') {
    if (!hasPassword) return jsonResponse({ needsPassword: true, job: pick(currentJob, PENDING_JOB_FIELDS) }, 409)

    if (!isValidPassword(password)) return new Response(null, { status: 400 })

    // Conditional on the owner still being a draft, so a suspension made since the lookup above isn't overridden
    if (!(await activateDraftUser(user.id, password))) {
      // Activated meanwhile (another tab, or a retry after a partial failure): publish, but this password wasn't set
      if (await getUserStatus(user.id) !== 'active') return new Response(null, { status: 400 })
      alreadyActive = true
    }
  }

  const verifyJob = await fetch(`${DB_URL}/items/jobs/${id}?fields=*,brief_file.id,brief_file.filename_download`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
    },
    body: JSON.stringify({
      verified_email: true
    })
  }).then(readJsonResponse).then(res => res?.data)

  if (!verifyJob) return new Response(null, { status: 400 })

  // Best-effort like the Telegram notification below: the job is already verified at this point
  await fetch(`${SENDRGRID_URL}/mail/send`, {
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
          { email: verifyJob.email, name: verifyJob.author_name }
        ],
        dynamic_template_data: {
          ...verifyJob,
          budget: budgetToRanges(verifyJob.budget)
        }
      }],
      template_id: "d-6629f64176d842458785b3e127c687f9"
    })
  })
    .then(discardResponse)
    .then(res => !res.ok && console.log('API Job Verify: confirmation email failed, status ', res.status))
    .catch(error => console.log('API Job Verify: confirmation email failed ', error))

  // Best-effort: the job is already verified, so a failed notification must not change the response
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: `👷 New Job created!
        \nAuthor name: ${verifyJob.author_name}
        \nemail: ${verifyJob.email}
        \nCompany: ${verifyJob.company}
        \nTitle: ${verifyJob.title}
        \nShort description: ${verifyJob.short_description}
        \nLong description: ${verifyJob.long_description}
        \nBudget: ${verifyJob.budget}
        ${verifyJob.brief_file ? `\nBrief file: [${verifyJob.brief_file.filename_download}](https://admin.dclstudios.org/assets/${verifyJob.brief_file.id})` : ''}
        ${verifyJob.deadline_date ? `\nDeadline date: ${verifyJob.deadline_date}` : ''}`
    })
  })
    .then(discardResponse)
    .then(res => !res.ok && console.log('API Job Verify: Telegram notification failed, status ', res.status))
    .catch(error => console.log('API Job Verify: Telegram notification failed ', error))

  return jsonResponse({ ...pick(verifyJob, PUBLIC_JOB_FIELDS), ...(alreadyActive ? { alreadyActive: true } : {}) })
}