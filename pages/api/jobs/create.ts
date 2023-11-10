import type { NextRequest } from 'next/server'
import { budgetToRanges } from '../../../components/utils'

export const config = {
  runtime: 'experimental-edge',
}


export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN
  
  const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
  const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN
  
  const { job, verified_email } = await req.json()

  try{
     const createJob = await fetch(`${DB_URL}/items/jobs?fields=*,brief_file.id,brief_file.filename_download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify( { 
        ...job, 
        short_description: job.short_description.join('\n'),
        verified_email : verified_email,
        geo: req.geo
      } )
    })
    .then((res) => res.ok && res.json())
    .then(body => body.data)

    if (createJob && verified_email) return new Response(JSON.stringify(createJob))
    
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
          personalizations: [ {
            to: [
                { email: createJob.email, name: createJob.author_name }
            ],
            dynamic_template_data: {
                ...createJob,
                budget: budgetToRanges(createJob.budget),
                verify_url: `https://studios.decentraland.org/jobs/verify?id=${createJob.id}`,
            }
        } ],
          template_id: "d-0dd32315fc5241c89e78783713c66934"
      })
    })

    if (sendMail.ok) return new Response(JSON.stringify(createJob))

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error )
    return new Response(null, { status: 400 })
  }
}
