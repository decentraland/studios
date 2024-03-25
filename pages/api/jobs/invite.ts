import type { NextRequest } from 'next/server'
import { budgetToRanges, isUUID } from '../../../components/utils'

export const config = {
  runtime: 'experimental-edge',
}


export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
  const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

  const user = req.cookies.get("auth")?.value
  if (!user) return new Response(null, { status: 401 })

  const authorization = JSON.parse(user).access_token

  const { email, job_id } = await req.json()

  if (!isUUID(job_id)) {
    return new Response(null, { status: 400 })
  }

  try {

    const currentUser = await fetch(`${DB_URL}/users/me?fields=id,email`, {
      headers: {
        'Authorization': `Bearer ${authorization}`
      }
    }).then(res => res.ok && res.json()).then(res => res.data && res.data)

    const jobData = currentUser && await fetch(`${DB_URL}/items/jobs/${job_id}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    })
      .then(res => res.ok && res.json())
      .then(body => body.data)


    if (!currentUser || !jobData) return new Response(null, { status: 400 })

    const allowedEmails = [jobData.email]

    const managers = JSON.parse(jobData.managers || "[]")

    for (const manager of managers) {
      const userMail = await fetch(`${DB_URL}/users/${manager.id}?fields=email`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      })
        .then(res => res.ok && res.json())
        .then(res => res.data.email)
      allowedEmails.push(userMail)
    }

    if (!allowedEmails.includes(currentUser.email)) {
      return new Response(null, { status: 403 })
    }

    const jobUpdate = jobData && await fetch(`${DB_URL}/items/jobs/${job_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        managers_invites: JSON.parse(jobData.managers_invites || '[]').concat(email)
      })
    }).then(res => res.ok && res.json()).then(body => body.data)

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
    })

    if (sendMail.ok) return new Response(JSON.stringify(email))

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error)
    return new Response(null, { status: 400 })
  }
}
