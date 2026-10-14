import type { NextRequest } from 'next/server'
import { budgetToRanges } from '../../../components/utils'
import { User } from '../../../interfaces/User'
import { createVerificationToken, getAccessToken, isBoundedString, isSameOrigin, pick, readJson, readJsonResponse, discardResponse } from '../../../lib/security'

export const config = {
  runtime: 'experimental-edge',
}


const JOB_FIELDS = ['title', 'budget', 'short_description', 'long_description', 'deadline_date', 'landing_url'] as const

export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
  const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
  
  const authorization = getAccessToken(req)
  if (!authorization) return new Response(null, { status: 401 })
  if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

  const { job: rawJob } = await readJson(req)
  const job = pick(rawJob || {}, JOB_FIELDS)

  if (
    !isBoundedString(job.title, 256) || !job.title ||
    !isBoundedString(job.budget, 64) || !job.budget ||
    !isBoundedString(job.long_description, 10000) || !job.long_description ||
    !Array.isArray(job.short_description) || job.short_description.length > 10 || !job.short_description.every(item => isBoundedString(item, 256)) ||
    (job.deadline_date !== undefined && job.deadline_date !== null && job.deadline_date !== '' && !isBoundedString(job.deadline_date, 64)) ||
    (job.landing_url !== undefined && job.landing_url !== null && !isBoundedString(job.landing_url, 2048))
  ) {
    return new Response(null, { status: 400 })
  }

  try {
    
    const currentUser: User & { status: string } = await fetch(`${DB_URL}/users/me?fields=id,email,first_name,last_name,company,role.name,status`, {
      headers: {
        'Authorization': `Bearer ${authorization}`
      }
    }).then(readJsonResponse).then(res => res?.data)

    if (!currentUser || currentUser.role.name !== "Client") return new Response(null, { status: 401 })

    // Only an account that already proved ownership of its email can publish without the verification step
    const verified_email = currentUser.status === 'active'

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
        verified_email: verified_email,
        geo: req.geo
      })
    })
      .then(readJsonResponse)
      .then(body => body?.data)

    if (!createJob) return new Response(null, { status: 400 })

    if (verified_email) {

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
    }

    const sendMail = await fetch(`${SENDRGRID_URL}/mail/send`, {
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
            { email: createJob.email, name: createJob.author_name }
          ],
          dynamic_template_data: {
            ...createJob,
            budget: budgetToRanges(createJob.budget),
            verify_url: `https://studios.decentraland.org/jobs/verify?id=${createJob.id}#token=${await createVerificationToken('job', createJob.id)}`,
          }
        }],
        template_id: "d-0dd32315fc5241c89e78783713c66934"
      })
    }).then(discardResponse)

    if (sendMail.ok) return new Response(JSON.stringify(createJob))

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error)
    return new Response(null, { status: 400 })
  }
}
