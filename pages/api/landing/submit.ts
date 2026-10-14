import { type NextRequest } from 'next/server'
import Landings from '../../../clients/Landings'
import { isBoundedString, isEmail, pick, readJson } from '../../../lib/security'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

const LEAD_FIELDS = ['name', 'email', 'slug', 'utm_source', 'utm_medium', 'utm_campaign', 'mobile', 'user_agent'] as const

export default async function (req: NextRequest) {

  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const body = await readJson(req)
  const lead = pick(body, LEAD_FIELDS)

  if (!isEmail(lead.email) || !isBoundedString(lead.slug, 256) || !lead.slug) return new Response(null, { status: 400 })

  for (const field of ['name', 'utm_source', 'utm_medium', 'utm_campaign', 'user_agent'] as const) {
    if (lead[field] !== undefined && lead[field] !== null && !isBoundedString(lead[field], 512)) return new Response(null, { status: 400 })
  }

  if (lead.email.includes('testing@example.com')) return new Response(null, { status: 401 })
  if ((lead.user_agent as string | undefined)?.includes('Acunetix')) return new Response(null, { status: 401 })

  // Marketing lists come from the landing itself so callers can't subscribe addresses to arbitrary lists
  const landing = await Landings.getLandingData(lead.slug)
  if (!landing) return new Response(null, { status: 400 })

  const customFields: Record<string, unknown> = { ...(landing.custom_fields || {}) }
  if (body.custom_fields && typeof body.custom_fields === 'object') {
    for (const [key, value] of Object.entries(body.custom_fields)) {
      if (/^[\w-]{1,64}$/.test(key) && (isBoundedString(value, 512) || Number.isFinite(value))) customFields[key] = value
    }
  }

  try {
    await fetch(`${DB_URL}/items/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        ...lead,
        list_ids: landing.list_ids,
        custom_fields: customFields,
        ip: req.ip,
        geo: req.geo
      })
    })

    //get custom fields definitions
    // console.log(await (await fetch(`${SENDRGRID_URL}/marketing/field_definitions`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
    //   }})).json())

    await fetch(`${SENDRGRID_URL}/marketing/contacts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        list_ids: landing.list_ids,
        contacts: [
          {
            email: lead.email,
            first_name: lead.name,
            custom_fields: customFields
          }
        ]
      })
    })

    // await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     chat_id: TELEGRAM_CHAT_ID,
    //     text: `🎉 New lead on ${body.slug}!\n${body.name} ${body.email}`
    //   })
    // })

    return new Response(null, { status: 204 })

  } catch (error) {
    return new Response(null, { status: 400 })
  }
}