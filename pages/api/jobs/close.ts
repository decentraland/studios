import type { NextRequest } from 'next/server'
import { discardResponse, getAccessToken, isBoundedString, isSameEmail, isSameOrigin, readJson, readJsonResponse } from '../../../lib/security'
import { budgetToRanges, isUUID } from '../../../components/utils'
import { User } from '../../../interfaces/User'

export const config = {
  runtime: 'experimental-edge',
}


export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const authorization = getAccessToken(req)
  if (!authorization) return new Response(null, { status: 401 })
  if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

  const { closed_poll, job_id } = await readJson(req)

  const isValidPoll = closed_poll === undefined || closed_poll === null || isBoundedString(closed_poll, 10000)

  if (!isUUID(job_id) || !isValidPoll) {
    return new Response(null, { status: 400 })
  }

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

    if (!jobData) return new Response(null, { status: 400 })


    jobData.managers = JSON.parse((jobData.managers as any) || "[]")

    const managers = [] as string[]

    for (const manager of jobData.managers as User[]) {
      const managerEmail = await fetch(`${DB_URL}/users/${manager.id}?fields=email`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }).then(readJsonResponse).then(body => body?.data?.email)
      // Deleted managers are skipped
      if (managerEmail) managers.push(managerEmail)
    }

    const jobManagersEmails = [...managers, jobData.email]

    if (!jobManagersEmails.some(email => isSameEmail(email, currentUser.email))) {
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
    }).then(discardResponse)

    if (jobUpdate.ok) return new Response(null, { status: 204 })

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error)
    return new Response(null, { status: 400 })
  }
}
