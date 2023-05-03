import type { NextRequest } from 'next/server'

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

  const body = await req.json()

  try {
    await fetch(`${DB_URL}/items/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        ...body,
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
        list_ids: body.list_ids,
        contacts: [
          {
            email: body.email,
            first_name: body.name,
            custom_fields: body.custom_fields
          }
        ]
      })
    })

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🎉 New lead on ${body.slug}!\n${body.name} ${body.email}`
      })
    })
    
    return new Response(null, { status: 204 })

  } catch (error) {
    console.log('Mailing list submit error: ', error)
    return new Response(null, { status: 400 })
  }
}