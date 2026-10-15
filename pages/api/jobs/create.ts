import type { NextRequest } from 'next/server'
import { User } from '../../../interfaces/User'
import { parseJobInput } from '../../../lib/jobs'
import { getRequestGeo } from '../../../lib/request'
import { getAccessToken, isSameOrigin, readJson, readJsonResponse, discardResponse } from '../../../lib/security'

export const config = {
  runtime: 'edge',
}


export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
  
  const authorization = getAccessToken(req)
  if (!authorization) return new Response(null, { status: 401 })
  if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

  const { job: rawJob } = await readJson(req)
  const job = parseJobInput(rawJob)

  if (!job) return new Response(null, { status: 400 })

  try {
    
    const currentUser: User & { status: string } = await fetch(`${DB_URL}/users/me?fields=id,email,first_name,last_name,company,role.name,status`, {
      headers: {
        'Authorization': `Bearer ${authorization}`
      }
    }).then(readJsonResponse).then(res => res?.data)

    if (!currentUser || currentUser.role.name !== "Client") return new Response(null, { status: 401 })

    // Directus only issues tokens to active users, which already proved ownership of their email
    if (currentUser.status !== 'active') return new Response(null, { status: 403 })

    const createJob = await fetch(`${DB_URL}/items/jobs?fields=*,brief_file.id,brief_file.filename_download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        ...job,
        email: currentUser.email,
        author_name: `${currentUser.first_name} ${currentUser.last_name}`,
        company: currentUser.company,
        short_description: (job.short_description as string[]).join('\n'),
        deadline_date: job.deadline_date || null,
        verified_email: true,
        geo: getRequestGeo(req)
      })
    })
      .then(readJsonResponse)
      .then(body => body?.data)

    if (!createJob) return new Response(null, { status: 400 })

    // Best-effort: the job already exists, so a failed notification must not change the response
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `👷 New Job created!
        \nAuthor name: ${createJob.author_name}
        \nemail: ${createJob.email}
        \nCompany: ${createJob.company}
        \nTitle: ${createJob.title}
        \nShort description: ${createJob.short_description}
        \nLong description: ${createJob.long_description}
        \nBudget: ${createJob.budget}
        ${createJob.brief_file ? `\nBrief file: [${createJob.brief_file.filename_download}](https://admin.dclstudios.org/assets/${createJob.brief_file.id})` : ''}
        ${createJob.deadline_date ? `\nDeadline date: ${createJob.deadline_date}` : ''}`
      })
    })
      .then(discardResponse)
      .then(res => !res.ok && console.log('API Job Create: Telegram notification failed, status ', res.status))
      .catch(error => console.log('API Job Create: Telegram notification failed ', error))

    return new Response(JSON.stringify(createJob))

  } catch (error) {
    console.log('API Review Submit error: ', error)
    return new Response(null, { status: 400 })
  }
}
