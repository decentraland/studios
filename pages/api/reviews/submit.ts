import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

export default async function (req: NextRequest) {
  
  const { review } = await req.json()

  try{

    const submitReview = await fetch(`${DB_URL}/items/reviews?fields=*,profile.name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(review)
    }).then(res => res.ok && res.json()).then(res => res.data && res.data)

    const sendMail = submitReview && await fetch(`${SENDRGRID_URL}/mail/send`, {
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
                { email: submitReview.email, name: submitReview.name }
            ],
            dynamic_template_data: {
              studioName: submitReview.profile.name, 
              reviewerName: submitReview.name,
              confirmUrl: `https://studios.decentraland.org/reviews/verify?uuid=${submitReview.uuid}`
                }
        } ],
          template_id: "d-8967311aea8f46a29471ae1049b2dcdc"
      })
    })

    if (sendMail.ok){
      return new Response(JSON.stringify(submitReview))
    }

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error )
    return new Response(null, { status: 400 })
  }
}
