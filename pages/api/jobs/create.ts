import type { NextRequest } from 'next/server'
import { budgetToRanges } from '../../../components/utils'
import { User } from '../../../interfaces/User'

export const config = {
  runtime: 'experimental-edge',
}


export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
  const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
  
  const user = req.cookies.get("auth")?.value
  if (!user) return new Response(null, { status: 401 })
  
  const authorization = JSON.parse(user).access_token
  const { job, verified_email } = await req.json()
  
  try {
    
    const currentUser: User = await fetch(`${DB_URL}/users/me?fields=id,email,first_name,last_name,company,role.name`, {
      headers: {
        'Authorization': `Bearer ${authorization}`
      }
    }).then(res => res.ok && res.json()).then(res => res.data && res.data)

    if (currentUser.role.name !== "Client") return new Response(null, { status: 401 })

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
        short_description: job.short_description.join('\n'),
        verified_email: verified_email,
        geo: req.geo
      })
    })
      .then((res) => res.ok && res.json())
      .then(body => body.data)

    if (createJob && verified_email) {

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

      return new Response(JSON.stringify(createJob))
    }

    const sendMail = createJob && await fetch(`${SENDRGRID_URL}/mail/send`, {
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
            verify_url: `https://studios.decentraland.org/jobs/verify?id=${createJob.id}`,
          }
        }],
        template_id: "d-0dd32315fc5241c89e78783713c66934"
      })
    })

    if (sendMail.ok) return new Response(JSON.stringify(createJob))

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error)
    return new Response(null, { status: 400 })
  }
}
