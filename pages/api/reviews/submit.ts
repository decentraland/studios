import type { NextRequest } from 'next/server'
import { createVerificationToken, discardResponse, isBoundedString, isEmail, pick, readJson, readJsonResponse } from '../../../lib/security'
import { getClientIp, turnstileRejected, verifyTurnstile } from '../../../lib/turnstile'

export const config = {
  runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

const REVIEW_FIELDS = ['name', 'company', 'review', 'email', 'user_agent'] as const

export default async function (req: NextRequest) {

  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const { review: rawReview, turnstileToken } = await readJson(req)

  if (!await verifyTurnstile(turnstileToken, getClientIp(req), 'review')) return turnstileRejected()

  const review = pick(rawReview || {}, REVIEW_FIELDS)
  const profileSlug = rawReview?.profile

  if (
    !isEmail(review.email) ||
    !isBoundedString(profileSlug, 256) || !profileSlug ||
    !isBoundedString(review.name, 256) || !review.name ||
    !isBoundedString(review.company, 256) ||
    !isBoundedString(review.review, 2000) || !review.review ||
    (review.user_agent !== undefined && !isBoundedString(review.user_agent, 512))
  ) {
    return new Response(null, { status: 400 })
  }

  if ((review.user_agent as string | undefined)?.includes('Acunetix')) return new Response(null, { status: 401 })

  try {

    const partnerData = await fetch(`${DB_URL}/items/profile?filter[slug][_eq]=${encodeURIComponent(profileSlug)}&fields=id`)
      .then(readJsonResponse)
      .then(res => res?.data?.[0])

    if (!partnerData) return new Response(null, { status: 400 })

    const submitReview = await fetch(`${DB_URL}/items/reviews?fields=id,uuid,name,email,profile.name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        ...review,
        profile: partnerData.id
      })
    }).then(readJsonResponse).then(res => res?.data)

    if (!submitReview?.uuid) return new Response(null, { status: 400 })

    const token = await createVerificationToken('review', submitReview.uuid)

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
            { email: submitReview.email, name: submitReview.name }
          ],
          dynamic_template_data: {
            studioName: submitReview.profile.name,
            reviewerName: submitReview.name,
            confirmUrl: `https://studios.decentraland.org/reviews/verify?uuid=${submitReview.uuid}#token=${token}`
          }
        }],
        template_id: "d-8967311aea8f46a29471ae1049b2dcdc"
      })
    }).then(discardResponse)

    if (sendMail.ok) {
      // Only echo what the form needs: the review uuid must reach the reviewer by email only
      return new Response(JSON.stringify({ email: submitReview.email }))
    }

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error)
    return new Response(null, { status: 400 })
  }
}
