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

  const { id } = await req.json()

  const currentJob = await fetch(`${DB_URL}/items/jobs/${id}?fields=*,brief_file.id,brief_file.filename_download`, {
    method: 'GET',
    headers: {
    'Authorization': `Bearer ${API_TOKEN}`
    }
  }).then(res => res.ok && res.json()).then(res => res.data && res.data)

  if (currentJob.verified_email){
    return new Response(JSON.stringify(currentJob))
  }

  const verify = await fetch(`${DB_URL}/items/jobs/${id}?fields=*,brief_file.id,brief_file.filename_download`, {
      method: 'PATCH',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        verified_email: true
      })
  }).then(res => res.ok && res.json()).then(res => res.data && res.data)

  verify && await fetch(`${SENDRGRID_URL}/mail/send`, {
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
              { email: verify.email, name: verify.author_name }
          ],
          dynamic_template_data: {
              ...verify,
              budget: budgetToRanges(verify.budget)
          }
      } ],
        template_id: "d-6629f64176d842458785b3e127c687f9"
    })
  })

  return new Response(JSON.stringify(verify))
}