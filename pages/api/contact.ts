import type { NextRequest } from 'next/server'
import Partners from '../../clients/Partners'
import { discardResponse, isBoundedString, isEmail, readJson } from '../../lib/security'

export const config = {
  runtime: 'experimental-edge',
}

const MESSAGE_MAX_LENGTH = 5000

export default async function (req: NextRequest) {

  const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
  const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const { slug, senderEmail, message } = await readJson(req)

  if (!isBoundedString(slug, 256) || !slug || !isEmail(senderEmail) || !isBoundedString(message, MESSAGE_MAX_LENGTH) || !message.trim()) {
    return new Response(null, { status: 400 })
  }

  try {

    // The recipient is always the studio's registered email, never an address supplied by the caller
    const partner = await Partners.getPartnerData({ slug }, 'email')

    if (!isEmail(partner?.email)) return new Response(null, { status: 400 })

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
            { email: partner?.email }
          ],
          dynamic_template_data: {
            email: senderEmail,
            message: message,
          }
        }],
        template_id: "d-28527382ba9d4313ba271ae91eede3a6"
      })
    }).then(discardResponse)

    if (sendMail.ok) return new Response(null, {status: 204})

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Contact error: ', error)
    return new Response(null, { status: 400 })
  }
}
