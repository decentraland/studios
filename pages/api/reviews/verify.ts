import type { NextRequest } from 'next/server'
import { PartnerReview } from '../../../interfaces/PartnerReview'
import { isUUID } from '../../../components/utils'

export const config = {
  runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

export default async function (req: NextRequest) {

  const { uuid  } = await req.json()

  try {

    if (!isUUID(uuid)) {
      return new Response(null, { status: 400 })
    }

    const review = await fetch(`${DB_URL}/items/reviews?filter[uuid]=${uuid}&fields=id,name,company,review,verified_mail,profile.email,profile.name,profile.slug`, {
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
      },
      }).then(res => res.ok && res.json()).then(res => res.data && res.data[0]) as PartnerReview

    if (review.verified_mail){
      return new Response(JSON.stringify(review))
    }

    const verify = await fetch(`${DB_URL}/items/reviews/${review.id}?fields=id,name,company,review,profile.email,profile.name,profile.slug`, {
      method: 'PATCH',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        verified_mail: true
      })
    }).then(res => res.ok && res.json()).then(res => res.data && res.data) as PartnerReview

    const sendMail = verify && await fetch(`${SENDRGRID_URL}/mail/send`, {
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
              { email: verify.profile.email, name: verify.profile.name }
          ],
          bcc: [{ email: 'studios@decentraland.org' }],
          dynamic_template_data: {
            studioName: verify.profile.name,
            studioUrl: `https://studios.decentraland.org/profile/${verify.profile.slug}`,
           reviewerName: review.name,
           reviewerCompany: review.company
              }
      } ],
        template_id: "d-0b9b647fcd9748448f7bbd79527e89a9"
    })
  })

  if (sendMail.ok){
      return new Response(JSON.stringify(review))
    }

  } catch (error){
    console.log('API Review Verify error: ', error )
    return new Response(null, { status: 400 })

  }
}