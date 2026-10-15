import type { NextRequest } from 'next/server'
import { budgetToRanges, isUUID } from '../../../components/utils'
import { discardResponse, isValidVerificationToken, pick, readJson, readJsonResponse } from '../../../lib/security'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

const PUBLIC_JOB_FIELDS = ['id', 'title', 'author_name', 'company', 'short_description', 'long_description', 'budget', 'deadline_date', 'brief_file', 'verified_email'] as const

export default async function (req: NextRequest) {

  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const { id, token } = await readJson(req)

  if (typeof id !== 'string' || !isUUID(id) || !(await isValidVerificationToken('job', id, token))) {
    return new Response(null, { status: 400 })
  }

  const currentJob = await fetch(`${DB_URL}/items/jobs/${id}?fields=*,brief_file.id,brief_file.filename_download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  }).then(readJsonResponse).then(res => res?.data)

  if (!currentJob) return new Response(null, { status: 400 })

  if (currentJob.verified_email) {
    return new Response(JSON.stringify(pick(currentJob, PUBLIC_JOB_FIELDS)))
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

  const user = await fetch(`${DB_URL}/users?filter[email][_eq]=${encodeURIComponent(verifyJob.email)}&fields=id,status`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  })
    .then(readJsonResponse)
    .then(body => body?.data?.[0])

  // Only pending sign ups can be activated: suspended or archived accounts must stay that way
  const verifyUser = user?.status === 'draft' ? await fetch(`${DB_URL}/users/${user.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
    },
    body: JSON.stringify({
      status: "active"
    })
  }).then(readJsonResponse).then(res => res?.data) : user?.status === 'active' && user

  // Best-effort like the Telegram notification below: the job is already verified at this point
  verifyUser && await fetch(`${SENDRGRID_URL}/mail/send`, {
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

  return new Response(JSON.stringify(pick(verifyJob, PUBLIC_JOB_FIELDS)))
}