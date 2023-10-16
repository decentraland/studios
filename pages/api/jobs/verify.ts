import type { NextRequest } from 'next/server'
import { budgetToRanges } from '../../../components/utils'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export default async function (req: NextRequest) {

  const { id } = await req.json()

  const currentJob = await fetch(`${DB_URL}/items/jobs/${id}?fields=*,brief_file.id,brief_file.filename_download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  }).then(res => res.ok && res.json()).then(res => res.data && res.data)

  if (currentJob.verified_email) {
    return new Response(JSON.stringify(currentJob))
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
  }).then(res => res.ok && res.json()).then(res => res.data && res.data)

  const user = await fetch(`${DB_URL}/users?filter[email]=${encodeURIComponent(verifyJob.email)}`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  })
    .then(res => res.ok && res.json())
    .then(body => body.data[0])

  const verifyUser = user && await fetch(`${DB_URL}/users/${user.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
    },
    body: JSON.stringify({
      status: "active"
    })
  }).then(res => res.ok && res.json()).then(res => res.data && res.data)

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

  return new Response(JSON.stringify(verifyJob))
}