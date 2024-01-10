import type { NextRequest } from 'next/server'
import { budgetToRanges } from '../../../components/utils'
import { User } from '../../../interfaces/User'

export const config = {
  runtime: 'experimental-edge',
}


export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const user = req.cookies.get("auth")?.value
  if (!user) return new Response(null, { status: 401 })

  const authorization = JSON.parse(user).access_token

  const { closed_poll, job_id } = await req.json()

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

    if (!jobData) return new Response(null, { status: 400 })


    jobData.managers = JSON.parse((jobData.managers as any) || "[]")

    const managers = [] as User[]

    for (const manager of jobData.managers) {
      managers.push(await fetch(`${DB_URL}/users/${manager.id}?fields=email`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }).then(res => res.ok && res.json()).then(body => body.data.email))
    }

    const jobManagersEmails = [...managers, jobData.email]
    
    if (!jobManagersEmails.includes(currentUser.email)) {
      return new Response(null, { status: 400 })
    }

    const jobUpdate = jobData && await fetch(`${DB_URL}/items/jobs/${job_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        closed_poll: closed_poll,
        status: 'archived'
      })
    })

    if (jobUpdate.ok) return new Response(null, { status: 204 })

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error)
    return new Response(null, { status: 400 })
  }
}
