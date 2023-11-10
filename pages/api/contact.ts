import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}


export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
  const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

  const { partnerEmail, senderEmail, message } = await req.json()

  try {

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
        reply_to: {
            email: senderEmail
        },
        personalizations: [{
          to: [
            { email: partnerEmail }
          ],
          dynamic_template_data: {
            email: senderEmail,
            message: message,
          }
        }],
        template_id: "d-28527382ba9d4313ba271ae91eede3a6"
      })
    })

    if (sendMail.ok) return new Response(null, {status: 204})

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Contact error: ', error)
    return new Response(null, { status: 400 })
  }
}
