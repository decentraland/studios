import type { NextRequest } from 'next/server'
import { discardResponse, getAccessToken, isEmail, isSameEmail, isSameOrigin, normalizeEmail, readJson, readJsonResponse } from '../../../lib/security'
import { budgetToRanges, isUUID } from '../../../components/utils'
import { getUsersBy } from '../../../lib/users'

export const config = {
  runtime: 'experimental-edge',
}


const MAX_PENDING_INVITES = 20

// When the cap is reached the oldest pending invite is dropped, so unanswered invites can't block a job
const addPendingInvite = (invites: string[], email: string) => {
  const pending = invites.filter(invite => normalizeEmail(invite) !== email)
  return pending.slice(Math.max(0, pending.length - MAX_PENDING_INVITES + 1)).concat(email)
}

export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
  const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

  const authorization = getAccessToken(req)
  if (!authorization) return new Response(null, { status: 401 })
  if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

  const { email: rawEmail, job_id } = await readJson(req)

  if (!isUUID(job_id) || !isEmail(rawEmail)) {
    return new Response(null, { status: 400 })
  }

  const email = normalizeEmail(rawEmail)

  try {

    const currentUser = await fetch(`${DB_URL}/users/me?fields=id,email`, {
      headers: {
        'Authorization': `Bearer ${authorization}`
      }
    }).then(readJsonResponse).then(res => res?.data)

    const jobData = currentUser && await fetch(`${DB_URL}/items/jobs/${job_id}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    })
      .then(readJsonResponse)
      .then(body => body?.data)


    if (!currentUser || !jobData) return new Response(null, { status: 400 })

    const allowedEmails = [jobData.email]

    const managers = JSON.parse(jobData.managers || "[]")

    // Deleted managers are skipped
    const managersData = await getUsersBy('id', managers.map((manager: any) => manager?.id), 'email', API_TOKEN)
    allowedEmails.push(...managersData.map(manager => manager.email).filter(Boolean))

    if (!allowedEmails.some(allowedEmail => isSameEmail(allowedEmail, currentUser.email))) {
      return new Response(null, { status: 403 })
    }

    const managersInvites: string[] = JSON.parse(jobData.managers_invites || '[]')

    if (managersInvites.some(invite => normalizeEmail(invite) === email)) return new Response(null, { status: 400 })

    const jobUpdate = jobData && await fetch(`${DB_URL}/items/jobs/${job_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        managers_invites: addPendingInvite(managersInvites, email)
      })
    }).then(readJsonResponse).then(body => body?.data)

    const sendMail = jobUpdate && await fetch(`${SENDRGRID_URL}/mail/send`, {
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
            { email: email }
          ],
          dynamic_template_data: {
            job_author: jobData.author_name,
            job_title: jobData.title,
            link_url: `https://studios.decentraland.org/jobs/manage?id=${jobData.id}`,
          }
        }],
        template_id: "d-230079c83bf64f6187debd8f3126de3f"
      })
    }).then(discardResponse)

    if (sendMail && sendMail.ok) return new Response(JSON.stringify(email))

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error)
    return new Response(null, { status: 400 })
  }
}
