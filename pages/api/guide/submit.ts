import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {

  const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
  const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

  const body = await req.json()

  try {
    await fetch(`${DB_URL}/items/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(body)
    })

    // await fetch(`${SENDRGRID_URL}/mail/send`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
    //   },
    //   body: JSON.stringify({
    //     from: {
    //       email: "metaverse.studios@decentraland.org", name: "Metaverse Studios"
    //     },
    //     personalizations: [
    //       {
    //         to: [
    //           { email: body.email }
    //         ],
    //         dynamic_template_data: {
    //           name: body.name,
    //           pdfUrl: body.pdfUrl
    //         }
    //       }],
    //     template_id: "d-d66ce471d8ae47f18f036a1ebfeca73e"
    //   })
    // })

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
        list_ids: ["f3748621-3758-4c5a-aea5-dea74eef93fc"],
        contacts: [
          {
            email: body.email,
            first_name: body.name,
            custom_fields: {
              e3_T: body.pdfUrl
            }
            
          }
        ]
      })
    })

    
    return new Response(null, { status: 204 })

  } catch (error) {
    console.log('Mailing list submit error: ', error)
    return new Response(null, { status: 400 })
  }
}